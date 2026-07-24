export type ReferencePdf = {
   name: string
   url: string
}

export type ChatResponse = {
   id: string
   message: string
   references?: ReferencePdf[]
}
