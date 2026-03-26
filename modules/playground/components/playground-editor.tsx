"use client"

import { useRef, useEffect } from "react"
import Editor, { type Monaco } from "@monaco-editor/react"
import { registerCompletion, type CompletionRegistration } from "monacopilot"
import { TemplateFile } from "../lib/path-to-json"
import { configureMonaco, defaultEditorOptions, getEditorLanguage } from "../lib/editor-config"

interface PlaygroundEditorProps {
  activeFile: TemplateFile | undefined
  content: string
  onContentChange: (value: string) => void
  aiEnabled: boolean
  onAiLoadingChange: (loading: boolean) => void
}

export const PlaygroundEditor = ({
  activeFile,
  content,
  onContentChange,
  aiEnabled,
  onAiLoadingChange,
}: PlaygroundEditorProps) => {
  const editorRef = useRef<any>(null)
  const monacoRef = useRef<Monaco | null>(null)
  const completionRef = useRef<CompletionRegistration | null>(null)

  const getFilename = () =>
    activeFile ? `${activeFile.filename}.${activeFile.fileExtension}` : undefined

  const registerAICompletion = (editor: any, monaco: Monaco) => {
    completionRef.current = registerCompletion(monaco, editor, {
      endpoint: "/api/code-completion",
      language: activeFile ? getEditorLanguage(activeFile.fileExtension || "") : "plaintext",
      filename: getFilename(),
      technologies: ["react", "next.js", "typescript", "tailwindcss"],
      onCompletionRequested: () => onAiLoadingChange(true),
      onCompletionRequestFinished: () => onAiLoadingChange(false),
      onError: (error) => {
        console.error("AI completion error:", error)
        onAiLoadingChange(false)
      },
    })
  }

  const handleEditorDidMount = (editor: any, monaco: Monaco) => {
    editorRef.current = editor
    monacoRef.current = monaco

    editor.updateOptions({
      ...defaultEditorOptions,
      inlineSuggest: {
        enabled: true,
        mode: "prefix",
      },
    })

    configureMonaco(monaco)

    if (aiEnabled) {
      registerAICompletion(editor, monaco)
    }

    updateEditorLanguage()
  }

  const updateEditorLanguage = () => {
    if (!activeFile || !monacoRef.current || !editorRef.current) return
    const model = editorRef.current.getModel()
    if (!model) return

    const language = getEditorLanguage(activeFile.fileExtension || "")
    try {
      monacoRef.current.editor.setModelLanguage(model, language)
    } catch (error) {
      console.warn("Failed to set editor language:", error)
    }
  }

  // Register/deregister the AI completion provider as the toggle changes
  useEffect(() => {
    if (!editorRef.current || !monacoRef.current) return

    if (aiEnabled && !completionRef.current) {
      registerAICompletion(editorRef.current, monacoRef.current)
    } else if (!aiEnabled && completionRef.current) {
      completionRef.current.deregister()
      completionRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aiEnabled])

  // Keep the editor language and completion options in sync with the active file
  useEffect(() => {
    updateEditorLanguage()

    if (completionRef.current && activeFile) {
      const language = getEditorLanguage(activeFile.fileExtension || "")
      const filename = getFilename()
      completionRef.current.updateOptions(() => ({ language, filename }))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeFile])

  useEffect(() => {
    return () => {
      completionRef.current?.deregister()
      completionRef.current = null
    }
  }, [])

  return (
    <div className="h-full relative">
      <Editor
        height="100%"
        value={content}
        onChange={(value) => onContentChange(value || "")}
        onMount={handleEditorDidMount}
        language={activeFile ? getEditorLanguage(activeFile.fileExtension || "") : "plaintext"}
        // @ts-ignore
        options={defaultEditorOptions}
      />
    </div>
  )
}
