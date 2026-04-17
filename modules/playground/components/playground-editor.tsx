"use client"

import { useRef, useEffect, useState } from "react"
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
  const [isEditorReady, setIsEditorReady] = useState(false)

  const language = activeFile
    ? getEditorLanguage(activeFile.fileExtension || "")
    : "plaintext"
  const filename = activeFile
    ? `${activeFile.filename}.${activeFile.fileExtension}`
    : undefined

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
    updateEditorLanguage()
    setIsEditorReady(true)
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

  // Keep the editor's model language in sync with the active file.
  useEffect(() => {
    updateEditorLanguage()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeFile])

  // Register the AI completion provider, and re-register it whenever the
  // language changes.
  //
  // monacopilot binds the provider to the language passed at registration
  // (`registerInlineCompletionsProvider(language, ...)`), and its
  // `updateOptions` only mutates its internal options object — it does NOT
  // move the provider to a new language. So updating options on a file switch
  // left the provider registered against the *previous* file's language, and
  // Monaco simply stopped calling it. Deregistering and re-registering is the
  // only way to follow the active file.
  useEffect(() => {
    if (!isEditorReady || !editorRef.current || !monacoRef.current) return

    if (!aiEnabled) return

    const registration = registerCompletion(
      monacoRef.current,
      editorRef.current,
      {
        endpoint: "/api/code-completion",
        language,
        filename,
        technologies: ["react", "next.js", "typescript", "tailwindcss"],
        onCompletionRequested: () => onAiLoadingChange(true),
        onCompletionRequestFinished: () => onAiLoadingChange(false),
        onError: (error) => {
          console.error("AI completion error:", error)
          onAiLoadingChange(false)
        },
      }
    )
    completionRef.current = registration

    return () => {
      registration.deregister()
      if (completionRef.current === registration) {
        completionRef.current = null
      }
      onAiLoadingChange(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditorReady, aiEnabled, language, filename])

  return (
    <div className="h-full relative">
      <Editor
        height="100%"
        value={content}
        onChange={(value) => onContentChange(value || "")}
        onMount={handleEditorDidMount}
        language={language}
        // @ts-ignore
        options={defaultEditorOptions}
      />
    </div>
  )
}
