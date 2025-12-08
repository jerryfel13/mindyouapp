"use client"

import { useState, useRef, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  PhoneOff, 
  Monitor, 
  Users,
  Maximize2,
  Minimize2,
  Settings,
  MessageSquare,
  Loader2
} from "lucide-react"
import ProtectedRoute from "@/components/protected-route"
import { getUserData } from "@/lib/auth"
import { io, Socket } from "socket.io-client"

interface Participant {
  id: string
  socketId: string
  name: string
  isLocal: boolean
  isMuted: boolean
  isVideoOff: boolean
  isSpeaking?: boolean
  peerConnection?: RTCPeerConnection
  stream?: MediaStream
}

function VideoCallContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const appointmentId = searchParams.get("id") || "1"
  const userData = getUserData()
  
  const [isMuted, setIsMuted] = useState(false)
  const [isVideoOff, setIsVideoOff] = useState(true) // Camera off by default
  const [isScreenSharing, setIsScreenSharing] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showParticipants, setShowParticipants] = useState(false)
  const [showChat, setShowChat] = useState(false)
  const [isConnecting, setIsConnecting] = useState(true)
  const [participants, setParticipants] = useState<Participant[]>([])
  
  const localVideoRef = useRef<HTMLVideoElement>(null)
  const localStreamRef = useRef<MediaStream | null>(null)
  const socketRef = useRef<Socket | null>(null)
  const peerConnectionsRef = useRef<Map<string, RTCPeerConnection>>(new Map())
  const remoteStreamsRef = useRef<Map<string, MediaStream>>(new Map())
  const audioAnalyzersRef = useRef<Map<string, { analyser: AnalyserNode; audioContext: AudioContext }>>(new Map())
  const animationFrameRef = useRef<number | null>(null)
  
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'
  const userId = userData?.id || userData?.email_address || `user-${Date.now()}`
  const userName = userData?.full_name || "User"

  // Initialize Socket.io connection
  useEffect(() => {
    const socket = io(API_BASE_URL, {
      transports: ['websocket', 'polling']
    })

    socketRef.current = socket

    socket.on('connect', () => {
      console.log('Connected to signaling server')
      socket.emit('join-room', appointmentId, userId, userName)
      setIsConnecting(false)
      
      // Add local participant immediately (camera off by default)
      setParticipants(prev => {
        const existing = prev.find(p => p.isLocal)
        if (!existing) {
          return [{
            id: userId,
            socketId: socket.id,
            name: userName,
            isLocal: true,
            isMuted: false,
            isVideoOff: true, // Camera off by default
            isSpeaking: false,
          }]
        }
        return prev
      })
    })

    socket.on('room-users', (users: Array<{ socketId: string; userId: string; userName: string }>) => {
      console.log('Users in room:', users)
      // Initialize connections with existing users
      users.forEach(user => {
        createPeerConnection(user.socketId, user.userId, user.userName, true)
      })
    })

    socket.on('user-joined', (data: { socketId: string; userId: string; userName: string }) => {
      console.log('User joined:', data)
      createPeerConnection(data.socketId, data.userId, data.userName, true)
    })

    socket.on('user-left', (data: { socketId: string; userId: string; userName: string }) => {
      console.log('User left:', data)
      removeParticipant(data.socketId)
    })

    socket.on('offer', async (data: { offer: RTCSessionDescriptionInit; sender: string; senderId: string; senderName: string }) => {
      console.log('Received offer from:', data.sender)
      await handleOffer(data.offer, data.sender, data.senderId, data.senderName)
    })

    socket.on('answer', async (data: { answer: RTCSessionDescriptionInit; sender: string }) => {
      console.log('Received answer from:', data.sender)
      await handleAnswer(data.answer, data.sender)
    })

    socket.on('ice-candidate', async (data: { candidate: RTCIceCandidateInit; sender: string }) => {
      console.log('Received ICE candidate from:', data.sender)
      await handleIceCandidate(data.candidate, data.sender)
    })

    socket.on('user-audio-status', (data: { userId: string; userName: string; isMuted: boolean }) => {
      updateParticipantStatus(data.userId, { isMuted: data.isMuted })
    })

    socket.on('user-video-status', (data: { userId: string; userName: string; isVideoOff: boolean }) => {
      updateParticipantStatus(data.userId, { isVideoOff: data.isVideoOff })
    })

    return () => {
      socket.disconnect()
    }
  }, [appointmentId, userId, userName])

  // Initialize local audio stream (video off by default)
  useEffect(() => {
    const initializeLocalStream = async () => {
      try {
        // Only request audio initially (camera off by default)
        const stream = await navigator.mediaDevices.getUserMedia({
          video: false,
          audio: true,
        })
        
        localStreamRef.current = stream
        
        // Setup audio analyser immediately for local stream
        if (stream.getAudioTracks().length > 0) {
          setTimeout(() => {
            setupAudioAnalyser(stream, 'local')
          }, 200)
        }
      } catch (error) {
        console.error("Error accessing media devices:", error)
        // Don't stop connection if audio fails, user can retry
      }
    }

    if (socketRef.current?.connected && !localStreamRef.current) {
      initializeLocalStream()
    }

    return () => {
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop())
        localStreamRef.current = null
      }
    }
  }, [userId, userName])

  // Setup audio analyser for voice activity detection
  const setupAudioAnalyser = (stream: MediaStream, participantId: string) => {
    try {
      // Close existing audio context if any
      const existing = audioAnalyzersRef.current.get(participantId)
      if (existing) {
        existing.audioContext.close()
      }

      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const analyser = audioContext.createAnalyser()
      analyser.fftSize = 2048
      analyser.smoothingTimeConstant = 0.3

      const source = audioContext.createMediaStreamSource(stream)
      source.connect(analyser)

      audioAnalyzersRef.current.set(participantId, { analyser, audioContext })
      console.log(`Audio analyser setup for ${participantId}`)
    } catch (error) {
      console.error('Error setting up audio analyser:', error)
    }
  }

  // Monitor audio levels and detect speaking
  useEffect(() => {
    let isRunning = true

    const detectSpeaking = () => {
      if (!isRunning) return

      // Check local stream
      if (localStreamRef.current && localStreamRef.current.getAudioTracks().length > 0) {
        let localAnalyser = audioAnalyzersRef.current.get('local')
        if (!localAnalyser && localStreamRef.current.getAudioTracks()[0].enabled && !isMuted) {
          setupAudioAnalyser(localStreamRef.current, 'local')
          localAnalyser = audioAnalyzersRef.current.get('local')
        }
        
        if (localAnalyser && !isMuted) {
          // Use time domain data for better voice detection
          const bufferLength = localAnalyser.analyser.frequencyBinCount
          const dataArray = new Uint8Array(bufferLength)
          localAnalyser.analyser.getByteTimeDomainData(dataArray)
          
          // Calculate RMS (Root Mean Square) for volume level
          let sum = 0
          for (let i = 0; i < bufferLength; i++) {
            const normalized = (dataArray[i] - 128) / 128
            sum += normalized * normalized
          }
          const rms = Math.sqrt(sum / bufferLength)
          const volume = rms * 100
          
          // Also check frequency data as fallback
          const freqArray = new Uint8Array(bufferLength)
          localAnalyser.analyser.getByteFrequencyData(freqArray)
          const freqAvg = freqArray.reduce((a, b) => a + b) / freqArray.length
          
          // Lower threshold for better detection - use both time and frequency
          const isSpeaking = volume > 1.5 || freqAvg > 15
          
          // Update local participant
          setParticipants(prev => {
            const local = prev.find(p => p.isLocal)
            if (local && local.isSpeaking !== isSpeaking) {
              console.log(`Local speaking: ${isSpeaking}, volume: ${volume.toFixed(2)}%, freq: ${freqAvg.toFixed(2)}`)
              return prev.map(p => 
                p.isLocal ? { ...p, isSpeaking } : p
              )
            }
            return prev
          })
        } else if (isMuted) {
          // Clear speaking state when muted
          setParticipants(prev => {
            const local = prev.find(p => p.isLocal)
            if (local && local.isSpeaking) {
              return prev.map(p => 
                p.isLocal ? { ...p, isSpeaking: false } : p
              )
            }
            return prev
          })
        }
      }

      // Check remote streams
      remoteStreamsRef.current.forEach((stream, socketId) => {
        if (stream.getAudioTracks().length === 0) return
        
        let analyserData = audioAnalyzersRef.current.get(socketId)
        if (!analyserData && stream.getAudioTracks()[0].enabled) {
          setupAudioAnalyser(stream, socketId)
          analyserData = audioAnalyzersRef.current.get(socketId)
        }
        
        if (analyserData) {
          setParticipants(prev => {
            const participant = prev.find(p => p.socketId === socketId)
            if (!participant || participant.isMuted) {
              if (participant && participant.isSpeaking) {
                return prev.map(p => 
                  p.socketId === socketId ? { ...p, isSpeaking: false } : p
                )
              }
              return prev
            }

            // Use time domain data for better voice detection
            const bufferLength = analyserData.analyser.frequencyBinCount
            const dataArray = new Uint8Array(bufferLength)
            analyserData.analyser.getByteTimeDomainData(dataArray)
            
            // Calculate RMS (Root Mean Square) for volume level
            let sum = 0
            for (let i = 0; i < bufferLength; i++) {
              const normalized = (dataArray[i] - 128) / 128
              sum += normalized * normalized
            }
            const rms = Math.sqrt(sum / bufferLength)
            const volume = rms * 100
            
            // Also check frequency data as fallback
            const freqArray = new Uint8Array(bufferLength)
            analyserData.analyser.getByteFrequencyData(freqArray)
            const freqAvg = freqArray.reduce((a, b) => a + b) / freqArray.length
            
            // Lower threshold for better detection - use both time and frequency
            const isSpeaking = volume > 1.5 || freqAvg > 15
            
            if (participant.isSpeaking !== isSpeaking) {
              console.log(`Remote ${socketId} speaking state: ${isSpeaking}, volume: ${volume.toFixed(2)}%, freq: ${freqAvg.toFixed(2)}`)
              return prev.map(p => 
                p.socketId === socketId ? { ...p, isSpeaking } : p
              )
            }
            return prev
          })
        }
      })

      if (isRunning) {
        animationFrameRef.current = requestAnimationFrame(detectSpeaking)
      }
    }

    // Start detection after a short delay to allow analysers to initialize
    const timeoutId = setTimeout(() => {
      detectSpeaking()
    }, 500)

    return () => {
      isRunning = false
      clearTimeout(timeoutId)
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [isMuted])

  // Setup audio analysers when streams are added
  useEffect(() => {
    // Setup local stream analyser
    if (localStreamRef.current && localStreamRef.current.getAudioTracks().length > 0) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0]
      if (audioTrack.enabled && !audioAnalyzersRef.current.has('local')) {
        setupAudioAnalyser(localStreamRef.current, 'local')
      }
    }

    // Setup remote stream analysers
    remoteStreamsRef.current.forEach((stream, socketId) => {
      if (stream.getAudioTracks().length > 0) {
        const audioTrack = stream.getAudioTracks()[0]
        if (audioTrack.enabled && !audioAnalyzersRef.current.has(socketId)) {
          setupAudioAnalyser(stream, socketId)
        }
      }
    })

    return () => {
      // Don't cleanup here - let it cleanup when component unmounts
    }
  }, [participants.length]) // Re-run when participants change

  // Update video elements when participant streams change
  useEffect(() => {
    // Force re-render when participants change to update video elements
    const videoElements = document.querySelectorAll('video[data-remote="true"]')
    videoElements.forEach((videoEl) => {
      const video = videoEl as HTMLVideoElement
      if (video.srcObject) {
        const stream = video.srcObject as MediaStream
        // Ensure video tracks are enabled
        stream.getVideoTracks().forEach(track => {
          if (!track.enabled) {
            track.enabled = true
          }
        })
        // Force play
        video.play().catch(err => console.error('Error playing video:', err))
      }
    })
  }, [participants])

  const createPeerConnection = async (targetSocketId: string, targetUserId: string, targetUserName: string, isInitiator: boolean) => {
    if (!localStreamRef.current) {
      console.error('Local stream not available')
      return
    }

    const configuration = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
      ]
    }

    const peerConnection = new RTCPeerConnection(configuration)
    peerConnectionsRef.current.set(targetSocketId, peerConnection)

    // Add local stream tracks to peer connection
    localStreamRef.current.getTracks().forEach(track => {
      if (localStreamRef.current) {
        peerConnection.addTrack(track, localStreamRef.current)
      }
    })

    // Handle remote stream
    peerConnection.ontrack = (event) => {
      console.log('Received remote stream from:', targetSocketId)
      const remoteStream = event.streams[0]
      remoteStreamsRef.current.set(targetSocketId, remoteStream)
      
      // Ensure audio tracks are enabled
      remoteStream.getAudioTracks().forEach(track => {
        console.log(`Remote audio track: enabled=${track.enabled}, readyState=${track.readyState}, muted=${track.muted}`)
        if (!track.enabled) {
          console.warn(`⚠️ Remote audio track is disabled, enabling it...`)
          track.enabled = true
        }
      })
      
      // Ensure video tracks are enabled
      remoteStream.getVideoTracks().forEach(track => {
        console.log(`Remote video track: enabled=${track.enabled}, readyState=${track.readyState}, muted=${track.muted}`)
        if (!track.enabled) {
          console.warn(`⚠️ Remote video track is disabled, enabling it...`)
          track.enabled = true
        }
      })
      
      // Setup audio analyser for voice detection immediately
      if (remoteStream.getAudioTracks().length > 0) {
        const audioTrack = remoteStream.getAudioTracks()[0]
        if (audioTrack.enabled) {
          // Small delay to ensure stream is ready
          setTimeout(() => {
            setupAudioAnalyser(remoteStream, targetSocketId)
          }, 100)
        }
      }
      
      // Update participant with stream
      // Check if video is actually available and enabled
      const hasVideo = remoteStream.getVideoTracks().length > 0 && 
        remoteStream.getVideoTracks().some(track => track.enabled && track.readyState === 'live')
      
      setParticipants(prev => {
        const existing = prev.find(p => p.socketId === targetSocketId)
        if (existing) {
          return prev.map(p => 
            p.socketId === targetSocketId 
              ? { 
                  ...p, 
                  stream: remoteStream, 
                  isSpeaking: false,
                  isVideoOff: !hasVideo
                }
              : p
          )
        } else {
          return [...prev, {
            id: targetUserId,
            socketId: targetSocketId,
            name: targetUserName,
            isLocal: false,
            isMuted: remoteStream.getAudioTracks().length === 0 || !remoteStream.getAudioTracks()[0].enabled,
            isVideoOff: !hasVideo,
            isSpeaking: false,
            stream: remoteStream,
            peerConnection
          }]
        }
      })
      
      // Listen for track changes to update video status
      remoteStream.getVideoTracks().forEach(track => {
        track.addEventListener('enabled', () => {
          console.log(`Video track enabled for ${targetUserName}`)
          setParticipants(prev => prev.map(p => 
            p.socketId === targetSocketId 
              ? { ...p, isVideoOff: !track.enabled }
              : p
          ))
        })
        
        track.addEventListener('disabled', () => {
          console.log(`Video track disabled for ${targetUserName}`)
          setParticipants(prev => prev.map(p => 
            p.socketId === targetSocketId 
              ? { ...p, isVideoOff: true }
              : p
          ))
        })
      })
      
      // Force re-render by updating state
      setTimeout(() => {
        setParticipants(prev => [...prev])
      }, 100)
    }

    // Handle ICE candidates
    peerConnection.onicecandidate = (event) => {
      if (event.candidate && socketRef.current) {
        socketRef.current.emit('ice-candidate', {
          target: targetSocketId,
          candidate: event.candidate
        })
      }
    }

    // Handle connection state changes
    peerConnection.onconnectionstatechange = () => {
      console.log(`Connection state with ${targetSocketId}:`, peerConnection.connectionState)
      if (peerConnection.connectionState === 'failed' || peerConnection.connectionState === 'disconnected') {
        removeParticipant(targetSocketId)
      }
    }

    // Create offer if initiator
    if (isInitiator) {
      try {
        const offer = await peerConnection.createOffer()
        await peerConnection.setLocalDescription(offer)
        
        if (socketRef.current) {
          socketRef.current.emit('offer', {
            target: targetSocketId,
            offer: offer
          })
        }
      } catch (error) {
        console.error('Error creating offer:', error)
      }
    }
  }

  const handleOffer = async (offer: RTCSessionDescriptionInit, senderSocketId: string, senderUserId: string, senderUserName: string) => {
    await createPeerConnection(senderSocketId, senderUserId, senderUserName, false)
    
    const peerConnection = peerConnectionsRef.current.get(senderSocketId)
    if (peerConnection) {
      await peerConnection.setRemoteDescription(new RTCSessionDescription(offer))
      const answer = await peerConnection.createAnswer()
      await peerConnection.setLocalDescription(answer)
      
      if (socketRef.current) {
        socketRef.current.emit('answer', {
          target: senderSocketId,
          answer: answer
        })
      }
    }
  }

  const handleAnswer = async (answer: RTCSessionDescriptionInit, senderSocketId: string) => {
    const peerConnection = peerConnectionsRef.current.get(senderSocketId)
    if (peerConnection) {
      await peerConnection.setRemoteDescription(new RTCSessionDescription(answer))
    }
  }

  const handleIceCandidate = async (candidate: RTCIceCandidateInit, senderSocketId: string) => {
    const peerConnection = peerConnectionsRef.current.get(senderSocketId)
    if (peerConnection) {
      await peerConnection.addIceCandidate(new RTCIceCandidate(candidate))
    }
  }

  const removeParticipant = (socketId: string) => {
    const peerConnection = peerConnectionsRef.current.get(socketId)
    if (peerConnection) {
      peerConnection.close()
      peerConnectionsRef.current.delete(socketId)
    }
    remoteStreamsRef.current.delete(socketId)
    setParticipants(prev => prev.filter(p => p.socketId !== socketId))
  }

  const updateParticipantStatus = (participantId: string, status: { isMuted?: boolean; isVideoOff?: boolean }) => {
    setParticipants(prev => prev.map(p => 
      p.id === participantId ? { ...p, ...status } : p
    ))
  }

  const toggleMute = () => {
    const newMutedState = !isMuted
    setIsMuted(newMutedState)
    
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach(track => {
        track.enabled = !newMutedState
      })
    }

    // Update local participant status
    setParticipants(prev => prev.map(p => 
      p.isLocal ? { ...p, isMuted: newMutedState, isSpeaking: false } : p
    ))

    // Notify others
    if (socketRef.current) {
      socketRef.current.emit('user-audio-status', {
        isMuted: newMutedState
      })
    }
  }

  const toggleVideo = async () => {
    const newVideoOffState = !isVideoOff
    
    if (newVideoOffState) {
      // Turning video OFF - just disable video tracks
      if (localStreamRef.current) {
        localStreamRef.current.getVideoTracks().forEach(track => {
          track.enabled = false
        })
      }
      
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = null
      }
    } else {
      // Turning video ON
      try {
        // If no stream exists, create one with audio first
        if (!localStreamRef.current) {
          const audioStream = await navigator.mediaDevices.getUserMedia({
            video: false,
            audio: true,
          })
          localStreamRef.current = audioStream
        }
        
        // Get video stream
        const videoStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false
        })
        
        const videoTrack = videoStream.getVideoTracks()[0]
        
        // Add video to existing stream by creating a new combined stream
        const audioTracks = localStreamRef.current.getAudioTracks()
        const combinedStream = new MediaStream([...audioTracks, videoTrack])
        
        // Stop old stream video tracks if any
        localStreamRef.current.getVideoTracks().forEach(track => track.stop())
        
        // Update stream reference
        const oldStream = localStreamRef.current
        localStreamRef.current = combinedStream
        
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = combinedStream
        }

        // Add video track to all existing peer connections
        peerConnectionsRef.current.forEach((peerConnection) => {
          const videoSender = peerConnection.getSenders().find(s => 
            s.track && s.track.kind === 'video'
          )
          
          if (videoSender) {
            // Replace existing video track
            videoSender.replaceTrack(videoTrack)
          } else {
            // Add new video track
            peerConnection.addTrack(videoTrack, combinedStream)
            
            // Need to renegotiate
            if (peerConnection.signalingState === 'stable') {
              peerConnection.createOffer().then(offer => {
                return peerConnection.setLocalDescription(offer)
              }).then(() => {
                const targetSocketId = Array.from(peerConnectionsRef.current.entries())
                  .find(([_, pc]) => pc === peerConnection)?.[0]
                if (socketRef.current && targetSocketId) {
                  socketRef.current.emit('offer', {
                    target: targetSocketId,
                    offer: peerConnection.localDescription
                  })
                }
              }).catch(err => console.error('Error renegotiating:', err))
            }
          }
        })
      } catch (error) {
        console.error("Error accessing camera:", error)
        return // Don't change state if we can't access camera
      }
    }
    
    setIsVideoOff(newVideoOffState)

    // Update local participant status
    setParticipants(prev => prev.map(p => 
      p.isLocal ? { 
        ...p, 
        isVideoOff: newVideoOffState,
        stream: newVideoOffState ? undefined : localStreamRef.current || undefined
      } : p
    ))

    // Notify others
    if (socketRef.current) {
      socketRef.current.emit('user-video-status', {
        isVideoOff: newVideoOffState
      })
    }
  }

  const toggleScreenShare = async () => {
    if (!isScreenSharing) {
      try {
        const stream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true,
        })
        
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream
        }

        // Replace video track in all peer connections
        const videoTrack = stream.getVideoTracks()[0]
        peerConnectionsRef.current.forEach((peerConnection) => {
          const sender = peerConnection.getSenders().find(s => 
            s.track && s.track.kind === 'video'
          )
          if (sender && videoTrack) {
            sender.replaceTrack(videoTrack)
          }
        })

        // Handle screen share end
        videoTrack.onended = () => {
          setIsScreenSharing(false)
          // Restore camera
          if (localStreamRef.current) {
            const cameraTrack = localStreamRef.current.getVideoTracks()[0]
            if (cameraTrack) {
              peerConnectionsRef.current.forEach((peerConnection) => {
                const sender = peerConnection.getSenders().find(s => 
                  s.track && s.track.kind === 'video'
                )
                if (sender && cameraTrack) {
                  sender.replaceTrack(cameraTrack)
                }
              })
            }
            if (localVideoRef.current) {
              localVideoRef.current.srcObject = localStreamRef.current
            }
          }
        }
        
        setIsScreenSharing(true)
      } catch (error) {
        console.error("Error sharing screen:", error)
      }
    }
  }

  const handleLeaveCall = () => {
    // Close all peer connections
    peerConnectionsRef.current.forEach((pc) => {
      pc.close()
    })
    peerConnectionsRef.current.clear()
    remoteStreamsRef.current.clear()

    // Stop local stream
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop())
    }

    // Disconnect socket
    if (socketRef.current) {
      socketRef.current.disconnect()
    }
    
    // Redirect based on user role
    const userRole = userData?.role || 'user'
    if (userRole === 'doctor') {
      router.push("/doctor-dashboard")
    } else if (userRole === 'admin') {
      router.push("/doctor")
    } else {
      router.push("/dashboard")
    }
  }

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      document.documentElement.requestFullscreen()
    } else {
      document.exitFullscreen()
    }
    setIsFullscreen(!isFullscreen)
  }

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }
    
    document.addEventListener("fullscreenchange", handleFullscreenChange)
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange)
  }, [])

  if (isConnecting) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted flex items-center justify-center p-4">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
          <p className="text-foreground text-lg">Connecting to call...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto bg-gray-900 rounded-lg shadow-2xl overflow-hidden flex flex-col" style={{ height: 'calc(100vh - 4rem)' }}>
        {/* Main Video Area */}
        <div className="flex-1 relative flex items-center justify-center p-4 md:p-6">
        <div className={`grid gap-4 w-full h-full max-w-6xl ${
          participants.length === 1 
            ? "grid-cols-1 max-w-4xl" 
            : participants.length === 2 
            ? "grid-cols-2" 
            : "grid-cols-2"
        }`}>
          {participants.map((participant) => (
            <Card 
              key={participant.socketId || participant.id} 
              className={`relative bg-gray-800 overflow-hidden aspect-video transition-all duration-300 ${
                participant.isSpeaking && !participant.isMuted
                  ? "border-[5px] border-green-500"
                  : "border-2 border-gray-700"
              }`}
              style={{
                boxShadow: participant.isSpeaking && !participant.isMuted
                  ? '0 0 0 5px rgb(34, 197, 94), 0 0 40px rgba(34, 197, 94, 0.8), 0 0 60px rgba(34, 197, 94, 0.6)'
                  : 'none',
              }}
            >
              {participant.isLocal ? (
                <video
                  ref={localVideoRef}
                  autoPlay
                  muted
                  playsInline
                  className={`w-full h-full object-cover ${
                    isVideoOff ? "hidden" : ""
                  }`}
                />
              ) : (
                <video
                  data-remote="true"
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                  ref={(videoElement) => {
                    if (videoElement && participant.stream) {
                      // Always set srcObject to ensure it's updated when stream changes
                      if (videoElement.srcObject !== participant.stream) {
                        videoElement.srcObject = participant.stream
                        console.log(`Setting remote video srcObject for ${participant.name}`)
                      }
                      
                      // Ensure audio is not muted
                      if (videoElement.muted) {
                        console.log(`Unmuting remote video for ${participant.name}`)
                        videoElement.muted = false
                      }
                      
                      // Ensure video tracks are enabled
                      participant.stream.getVideoTracks().forEach(track => {
                        if (!track.enabled) {
                          console.log(`Enabling remote video track for ${participant.name}`)
                          track.enabled = true
                        }
                      })
                      
                      // Force play to ensure video/audio works (browser autoplay policy)
                      videoElement.play().catch(err => {
                        console.error(`Error playing remote video for ${participant.name}:`, err)
                      })
                      
                      // Log track status
                      participant.stream.getTracks().forEach(track => {
                        console.log(`Remote ${track.kind} track for ${participant.name}: enabled=${track.enabled}, readyState=${track.readyState}`)
                      })
                      
                      // Listen for new tracks being added to the stream
                      participant.stream.addEventListener('addtrack', (event) => {
                        console.log(`New ${event.track.kind} track added to remote stream for ${participant.name}`)
                        if (event.track.kind === 'video') {
                          event.track.enabled = true
                          // Force re-render to show video
                          setParticipants(prev => [...prev])
                        }
                      })
                    }
                  }}
                />
              )}
              
              {/* Video Off Placeholder */}
              {(() => {
                // Check if video is actually off
                const hasVideo = participant.stream && 
                  participant.stream.getVideoTracks().length > 0 && 
                  participant.stream.getVideoTracks().some(track => track.enabled && track.readyState === 'live')
                const showPlaceholder = participant.isVideoOff || (!participant.isLocal && !hasVideo)
                
                return showPlaceholder ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-800 z-10">
                    <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center">
                      <span className="text-3xl font-semibold text-primary">
                        {participant.name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase()}
                      </span>
                    </div>
                  </div>
                ) : null
              })()}
              
              {/* Participant Info Overlay */}
              <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-lg">
                {participant.isMuted && (
                  <MicOff className="w-4 h-4 text-red-400" />
                )}
                {participant.isSpeaking && !participant.isMuted && (
                  <div className="relative">
                    <div className="absolute inset-0 w-4 h-4 bg-green-500 rounded-full animate-ping opacity-75"></div>
                    <Mic className="w-4 h-4 text-green-400 relative" />
                  </div>
                )}
                {participant.isVideoOff && participant.isLocal && (
                  <VideoOff className="w-4 h-4 text-red-400" />
                )}
                <span className="text-sm font-medium text-white">
                  {participant.name} {participant.isLocal && "(You)"}
                </span>
              </div>
              
              {/* Status Badges for Local User */}
              {participant.isLocal && (
                <>
                  {isMuted && (
                    <div className="absolute top-4 right-4 bg-red-500/90 backdrop-blur-sm px-3 py-1.5 rounded-full flex items-center gap-2">
                      <MicOff className="w-4 h-4 text-white" />
                      <span className="text-xs font-medium text-white">Muted</span>
                    </div>
                  )}
                  {isVideoOff && (
                    <div className="absolute top-4 right-4 bg-red-500/90 backdrop-blur-sm px-3 py-1.5 rounded-full flex items-center gap-2">
                      <VideoOff className="w-4 h-4 text-white" />
                      <span className="text-xs font-medium text-white">Camera Off</span>
                    </div>
                  )}
                </>
              )}
            </Card>
          ))}
        </div>

        {/* Sidebar for Participants/Chat */}
        {showParticipants && (
          <Card className="absolute right-4 top-4 bottom-20 w-80 bg-gray-800 border-gray-700 p-4 overflow-y-auto">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Users className="w-5 h-5" />
              Participants ({participants.length})
            </h3>
            <div className="space-y-3">
              {participants.map((p) => (
                <div key={p.socketId || p.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-700">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                    <span className="text-sm font-semibold text-primary">
                      {p.name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white">
                      {p.name} {p.isLocal && "(You)"}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      {p.isMuted && (
                        <MicOff className="w-3 h-3 text-red-400" />
                      )}
                      {p.isSpeaking && !p.isMuted && (
                        <div className="relative">
                          <div className="absolute inset-0 w-3 h-3 bg-green-500 rounded-full animate-ping opacity-75"></div>
                          <Mic className="w-3 h-3 text-green-400 relative" />
                        </div>
                      )}
                      {p.isVideoOff && (
                        <VideoOff className="w-3 h-3 text-gray-400" />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Chat Sidebar */}
        {showChat && (
          <Card className="absolute right-4 top-4 bottom-20 w-80 bg-gray-800 border-gray-700 p-4 flex flex-col">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Chat
            </h3>
            <div className="flex-1 overflow-y-auto mb-4 space-y-3">
              <div className="text-sm text-gray-400 text-center py-4">
                No messages yet. Start the conversation!
              </div>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Type a message..."
                className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <Button size="sm" className="bg-primary hover:bg-primary/90">
                Send
              </Button>
            </div>
          </Card>
        )}
        </div>

        {/* Controls Bar */}
        <div className="bg-gray-800 border-t border-gray-700 px-4 md:px-6 py-4">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
          {/* Left Controls */}
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleMute}
              title={isMuted ? "Unmute microphone" : "Mute microphone"}
              className={`w-14 h-14 rounded-full transition-all ${
                isMuted 
                  ? "bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/50" 
                  : "bg-gray-700 hover:bg-gray-600 text-white"
              }`}
            >
              {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleVideo}
              title={isVideoOff ? "Turn on camera" : "Turn off camera"}
              className={`w-14 h-14 rounded-full transition-all ${
                isVideoOff 
                  ? "bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/50" 
                  : "bg-gray-700 hover:bg-gray-600 text-white"
              }`}
            >
              {isVideoOff ? <VideoOff className="w-6 h-6" /> : <Video className="w-6 h-6" />}
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={toggleScreenShare}
              className={`w-14 h-14 rounded-full transition-all ${
                isScreenSharing 
                  ? "bg-primary hover:bg-primary/90 text-white" 
                  : "bg-gray-700 hover:bg-gray-600 text-white"
              }`}
            >
              <Monitor className="w-6 h-6" />
            </Button>
          </div>

          {/* Center - Leave Call */}
          <Button
            onClick={handleLeaveCall}
            className="w-14 h-14 rounded-full bg-red-500 hover:bg-red-600 text-white"
          >
            <PhoneOff className="w-6 h-6" />
          </Button>

          {/* Right Controls */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowParticipants(!showParticipants)}
              className={`w-12 h-12 rounded-full ${
                showParticipants 
                  ? "bg-primary hover:bg-primary/90 text-white" 
                  : "bg-gray-700 hover:bg-gray-600 text-white"
              }`}
            >
              <Users className="w-5 h-5" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowChat(!showChat)}
              className={`w-12 h-12 rounded-full ${
                showChat 
                  ? "bg-primary hover:bg-primary/90 text-white" 
                  : "bg-gray-700 hover:bg-gray-600 text-white"
              }`}
            >
              <MessageSquare className="w-5 h-5" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={toggleFullscreen}
              className="w-12 h-12 rounded-full bg-gray-700 hover:bg-gray-600 text-white"
            >
              {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="w-12 h-12 rounded-full bg-gray-700 hover:bg-gray-600 text-white"
            >
              <Settings className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
      </div>
    </div>
  )
}

export default function VideoCallPage() {
  return (
    <ProtectedRoute>
      <Suspense fallback={
        <div className="min-h-screen bg-gradient-to-b from-background to-muted flex items-center justify-center p-4">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
            <p className="text-foreground text-lg">Loading...</p>
          </div>
        </div>
      }>
        <VideoCallContent />
      </Suspense>
    </ProtectedRoute>
  )
}
