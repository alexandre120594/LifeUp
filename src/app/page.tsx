"use client"
import { useTaskStore } from "@/store/useTaskStore"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState } from "react"

export default function Home() {
  const { tasks, toggleTask, addTask } = useTaskStore()
  const [text, setText] = useState("")

  const handleAdd = () => {
    if(text.trim()){
      addTask(text)
      setText("")
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center p-8 bg-slate-100">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-bold mb-8 text-center">LifeUp</h1>
        <Card>
          <CardHeader>
            <CardTitle>Daily Tasks</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {tasks.map((task) => (
              <div key={task.id} className="flex items-center space-x-3 p-2 border-b last:border-0">
                <Checkbox
                  checked={task.completed}
                  onCheckedChange={() => toggleTask(task.id)}
                />
                <span className={task.completed ? "line-through text-muted-foreground" : ""}>
                  {task.title}
                </span>
              </div>
            ))}
            {tasks.length === 0 && <p className="text-sm text-center text-muted-foreground">No tasks yet!</p>}
          </CardContent>
        </Card>
      </div>

      <div className="w-full max-w-md mt-4">
        <Card>
          <CardHeader>
            <CardTitle>Add Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <Input title="Adicione uma task" placeholder="Digite uma task..." value={text} onChange={(e) => setText(e.target.value)}></Input>
          </CardContent>
          <CardContent>
            <Button onClick={handleAdd}>
              Adicionar task
            </Button>
          </CardContent>

        </Card>
      </div>
    </main>
  )
}