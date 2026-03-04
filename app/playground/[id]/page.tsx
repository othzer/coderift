"use client"
import { usePlayground } from '@/modules/playground/hooks/usePlayground';
import { useParams } from 'next/navigation'
import React from 'react'

const PlaygroundPage = () => {
    const {id} = useParams<{id: string}>();

    const {playgroundData, templateData, isLoading, error, saveTemplateData} = usePlayground(id);

    console.log("templateData", templateData);
    console.log("playgroundData", playgroundData);
  return (
    <div>
        Params: {id}
        PlaygroundPage
    </div>
  )
}

export default PlaygroundPage