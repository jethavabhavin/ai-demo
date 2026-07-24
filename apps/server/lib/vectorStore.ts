import { QdrantVectorStore } from '@langchain/qdrant'
import { GoogleGenerativeAIEmbeddings } from '@langchain/google-genai'
import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(__dirname, '..', '.env') })
dotenv.config()

export const embeddings = new GoogleGenerativeAIEmbeddings({
   apiKey: process.env.GEMINI_API_KEY,
   modelName: 'models/gemini-embedding-001',
})

let vectorStoreInstance: QdrantVectorStore | null = null

export async function getVectorStore(collectionName = 'pdf-rag'): Promise<QdrantVectorStore> {
   if (!vectorStoreInstance) {
      vectorStoreInstance = await QdrantVectorStore.fromExistingCollection(embeddings, {
         url: process.env.QDRANT_URL,
         collectionName,
      })
   }
   return vectorStoreInstance
}
