"use client"
import { chatAIAction } from "@/action/chat.ai";
import { formatedText } from "@/lib/utils";
import { Plus } from "lucide-react";
import { useState, useRef, useEffect } from "react"

export default function NotebookChatbot({ collections, id }: { collections: string, id: string }) {


  const [messages, setMessages] = useState<{ role: string; content: string }[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const chatEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSend = async () => {

    if (!input.trim() || !collections || !id) return

    const userMsg = { role: "user", content: input }
    setMessages((m) => [...m, userMsg])
    setInput("")
    setIsLoading(true)

    try {
      const res = await chatAIAction(input, collections, id);
      const formattedResponse = formatedText(res!);
      setMessages((m) => [...m, { role: "assistant", content: formattedResponse }])
    } catch (err) {
      setMessages((m) => [...m, { role: "assistant", content: "Oops! Something went wrong." }])
    } finally {
      setIsLoading(false)
    }
  }
  return (
    <div className="flex flex-col h-[95%] text-white rounded-lg shadow-lg p-4">
       {
        !collections && !id ? <h2 className=" text-gray-700 font-medium mx-auto mt-[250px] center gap-5"> <Plus /> Add a source to get started</h2> :
          (messages.length === 0 && <h2 className=" text-gray-700 font-medium mx-auto mt-[250px] center gap-5"> Ask anything about Contex...</h2>)
      }
      <div className="flex-1 overflow-y-auto space-y-4 p-2 mb-4 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900">

        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] px-4 py-2 rounded-2xl text-sm leading-relaxed ${msg.role === "user"
                ? "bg-[#cb1140c5] text-white rounded-br-none"
                : "card text-gray-700  rounded-bl-none"
                }`}
              dangerouslySetInnerHTML={{ __html: msg.content }}
            />
          </div>
        ))}

        {
          isLoading && (
             <div className="flex justify-start">
              <div className="max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed card rounded-bl-none animate-pulse">
                   <div className="flex flex-row gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#cb1140c5] animate-bounce"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-[#cb1140c5] animate-bounce [animation-delay:-.3s]"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-[#cb1140c5] animate-bounce [animation-delay:-.5s]"></div>
                  </div>
              </div>
            </div>
          )
        }
        <div ref={chatEndRef} />
      </div>

      <div className="flex items-center card border bordercolor rounded-full px-4 py-2">
        <input
            type="text"
          className="flex-1 bg-transparent outline-none text-zinc-700 placeholder-gray-400"
          placeholder="Ask me anything..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
        />
         <button
          className="ml-2 buttonbg  transition-colors px-4 py-2 rounded-full text-sm font-medium"
          onClick={handleSend}
        >
          Send
        </button>
      </div>


    </div>
  )
}
