"use client"

import { useState, useRef } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  Heart,
  Video,
  Mic,
  MicOff,
  VideoOff,
  Phone,
  Send,
  Settings,
  MessageSquare,
  Clock,
  FileText,
} from "lucide-react"

export default function ConsultationPage({ params }: { params: { id: string } }) {
  const [isMuted, setIsMuted] = useState(false)
  const [isVideoOff, setIsVideoOff] = useState(false)
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: "therapist",
      name: "Dr. Emily Chen",
      message: "Hello! How are you feeling today?",
      timestamp: "2:00 PM",
    },
    {
      id: 2,
      sender: "user",
      name: "You",
      message: "Hi Dr. Chen, I'm doing well. Ready to start.",
      timestamp: "2:01 PM",
    },
  ])
  const [newMessage, setNewMessage] = useState("")
  const [activeTab, setActiveTab] = useState<"chat" | "notes">("chat")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      setMessages([
        ...messages,
        {
          id: messages.length + 1,
          sender: "user",
          name: "You",
          message: newMessage,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ])
      setNewMessage("")
    }
  }

  const handleEndSession = () => {
    window.location.href = "/dashboard"
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border bg-background/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Heart className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-semibold text-foreground">Mind You</span>
          </Link>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span>Session Time: 45:32</span>
            </div>
            <Button variant="ghost" size="sm">
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex overflow-hidden">
        {/* Video Section */}
        <div className="flex-1 flex flex-col bg-muted">
          {/* Video Container */}
          <div className="flex-1 flex items-center justify-center p-4 relative">
            {/* Therapist Video */}
            <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg flex items-center justify-center relative overflow-hidden">
              <div className="text-center">
                <div className="w-24 h-24 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-4xl font-semibold mx-auto mb-4">
                  EC
                </div>
                <h2 className="text-2xl font-bold text-foreground">Dr. Emily Chen</h2>
                <p className="text-muted-foreground">Anxiety & Stress Specialist</p>
              </div>

              {/* User Video (Picture-in-Picture) */}
              <div className="absolute bottom-4 right-4 w-32 h-32 bg-secondary rounded-lg flex items-center justify-center border-2 border-border">
                <div className="text-center">
                  <div className="w-12 h-12 rounded-full bg-secondary-foreground flex items-center justify-center text-secondary text-lg font-semibold mx-auto mb-2">
                    SJ
                  </div>
                  <p className="text-xs text-secondary-foreground">You</p>
                </div>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="bg-background border-t border-border p-4 flex items-center justify-center gap-4">
            <Button
              onClick={() => setIsMuted(!isMuted)}
              variant={isMuted ? "destructive" : "outline"}
              size="lg"
              className={isMuted ? "" : "bg-transparent"}
            >
              {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </Button>
            <Button
              onClick={() => setIsVideoOff(!isVideoOff)}
              variant={isVideoOff ? "destructive" : "outline"}
              size="lg"
              className={isVideoOff ? "" : "bg-transparent"}
            >
              {isVideoOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
            </Button>
            <Button onClick={handleEndSession} variant="destructive" size="lg">
              <Phone className="w-5 h-5 mr-2" />
              End Session
            </Button>
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-80 border-l border-border bg-card flex flex-col">
          {/* Tabs */}
          <div className="flex border-b border-border">
            <button
              onClick={() => setActiveTab("chat")}
              className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
                activeTab === "chat"
                  ? "text-primary border-b-2 border-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <MessageSquare className="w-4 h-4 inline mr-2" />
              Chat
            </button>
            <button
              onClick={() => setActiveTab("notes")}
              className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
                activeTab === "notes"
                  ? "text-primary border-b-2 border-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <FileText className="w-4 h-4 inline mr-2" />
              Notes
            </button>
          </div>

          {/* Chat Tab */}
          {activeTab === "chat" && (
            <>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-xs ${
                        msg.sender === "user"
                          ? "bg-primary text-primary-foreground rounded-lg rounded-tr-none"
                          : "bg-muted text-foreground rounded-lg rounded-tl-none"
                      } p-3`}
                    >
                      <p className="text-xs font-semibold mb-1">{msg.name}</p>
                      <p className="text-sm">{msg.message}</p>
                      <p className="text-xs opacity-70 mt-1">{msg.timestamp}</p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="border-t border-border p-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                    placeholder="Type a message..."
                    className="flex-1 px-3 py-2 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                  />
                  <Button onClick={handleSendMessage} size="sm" className="bg-primary hover:bg-primary/90">
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </>
          )}

          {/* Notes Tab */}
          {activeTab === "notes" && (
            <div className="flex-1 overflow-y-auto p-4">
              <Card className="p-4 mb-4">
                <h3 className="font-semibold text-foreground mb-3">Session Notes</h3>
                <div className="space-y-3 text-sm text-muted-foreground">
                  <div>
                    <p className="font-medium text-foreground mb-1">Topics Discussed:</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Anxiety management techniques</li>
                      <li>Breathing exercises</li>
                      <li>Weekly goals</li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-medium text-foreground mb-1">Homework:</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Practice deep breathing daily</li>
                      <li>Keep anxiety journal</li>
                      <li>Complete mindfulness exercises</li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-medium text-foreground mb-1">Next Session:</p>
                    <p>December 22, 2024 at 2:00 PM</p>
                  </div>
                </div>
              </Card>

              <Card className="p-4 bg-accent/5 border-accent/20">
                <h3 className="font-semibold text-foreground mb-2">Resources</h3>
                <ul className="space-y-2 text-sm">
                  <li>
                    <a href="#" className="text-primary hover:underline">
                      Anxiety Management Guide
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-primary hover:underline">
                      Breathing Techniques Video
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-primary hover:underline">
                      Mindfulness App Recommendation
                    </a>
                  </li>
                </ul>
              </Card>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
