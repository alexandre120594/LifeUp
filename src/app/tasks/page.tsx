"use client";
import { useTaskStore } from "@/store/useTaskStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Edit, Send } from "lucide-react";
import { useCreateTask, useTask } from "@/hooks/useTaskMutation";
import { useForm } from "react-hook-form";
import { TaskCreateInput } from "@/types/BaseInterfaces";

export default function Home() {
  const { toggleTask, addTask, editTask } = useTaskStore();
  const [text, setText] = useState("");
  const [isEdit, setisEdit] = useState("");
  const [editarTask, seteditarTask] = useState("");
  const { register, reset, handleSubmit } = useForm<TaskCreateInput>();
  const { data: tasks, isLoading } = useTask();
  const { mutate, isPending } = useCreateTask();

  const onSubmit = (data: TaskCreateInput) => {
    const dataSubmit: TaskCreateInput = {
      title: data.title,
      projectId: "cmjof086d0000h0uu0l59g7p5",
      habitId: "cmjoucplc0001o4uupkn02txm",
    };
    mutate(dataSubmit, {
      onSuccess: () => reset,
    });
  };

  return (
    <main className="flex min-h-screen flex-col items-center p-8 bg-slate-100">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-bold mb-8 text-center">Yevox</h1>
        <Card>
          <CardHeader>
            <CardTitle>Daily Tasks</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {tasks?.map((task) => (
              <div
                key={task.id}
                className="flex items-center space-x-3 p-2 border-b last:border-0"
              >
                <Checkbox
                  checked={task.completed}
                  onCheckedChange={() => toggleTask(task.id)}
                />

                {isEdit === task.id ? (
                  <>
                    <Input
                      onChange={(e) => {
                        seteditarTask(e.target.value);
                      }}
                      value={editarTask}
                    ></Input>
                    <Button
                      variant={"outline"}
                      size={"icon"}
                      onClick={() => {
                        editTask(task.id, editarTask);
                        setisEdit("");
                      }}
                    >
                      <Send className="text-green-600"></Send>
                    </Button>
                  </>
                ) : (
                  <span
                    className={
                      task.completed ? "line-through text-muted-foreground" : ""
                    }
                  >
                    {task.title}
                  </span>
                )}

                {/* {isEdit !== task.id && (
                  <Button
                    variant={"outline"}
                    size={"icon"}
                    onClick={(e) => {
                      setisEdit(task.id)
                      seteditarTask(task.title)
                    }}
                  >
                    <Edit className="text-red-600"></Edit>
                  </Button>
                )} */}
              </div>
            ))}
            {tasks?.length === 0 && (
              <p className="text-sm text-center text-muted-foreground">
                No tasks yet!
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="w-full max-w-md mt-4">
        <Card>
          <CardHeader>
            <CardTitle>Add Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="flex gap-3">
              <Input
                {...register("title", {
                  required: "Campo não pode ser vazio!",
                })}
                title="Adicione uma task"
                placeholder="Digite uma task..."
                value={text}
                onChange={(e) => setText(e.target.value)}
              ></Input>
              <Button type="submit">Adicionar task</Button>
            </form>
          </CardContent>
          <CardContent></CardContent>
        </Card>
      </div>
    </main>
  );
}
