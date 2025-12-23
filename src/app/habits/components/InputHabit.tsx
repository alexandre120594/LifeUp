"use client"

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useHabitStore } from '@/store/useTaskStore';
import React, { useState } from 'react'

function InputHabit() {
    
  const [habitInput, setHabitInput] = useState("");

  const { addTask } = useHabitStore()

  const handleHabit = () => {
    if(habitInput != ""){
        addTask(habitInput)
    }
  }

  return (
    <div>
        <Card className='w-full max-w-md mt-4'>
            <CardHeader>Insira um habito:</CardHeader>
            <CardContent>
                <Input onChange={(e) => {setHabitInput(e.target.value)}}  placeholder='Insira um habito'></Input>
                   <Button onClick={handleHabit} className='text-center mt-4'>
              Adicionar Habito
            </Button>
            </CardContent>          
        </Card>
    </div>
  )
}

export default InputHabit