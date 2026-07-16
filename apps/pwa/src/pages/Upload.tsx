import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { env } from '@/config/env'

function fileToBase64(file: File): Promise<string> {
   return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = () => reject(new Error('Failed to read file'))
      reader.readAsDataURL(file)
   })
}

async function uploadImage(file: File) {
   const base64Image = await fileToBase64(file)
   const res = await fetch(env.apiUrl + '/api/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: base64Image }),
   })

   if (!res.ok) {
      throw new Error(`Upload failed: ${res.status}`)
   }

   return res.json()
}

export default function Upload() {
   const [previewImage, setPreviewImage] = useState('')

   const uploadMutation = useMutation({
      mutationFn: uploadImage,
      onSuccess: (data) => {
         console.log('Uploaded:', data.url)
      },
      onError: (error) => {
         console.error('Upload error:', error)
      },
   })

   function onUploaadImage(e: React.ChangeEvent<HTMLInputElement>) {
      const file = e.target.files?.[0]
      if (!file) return

      const fileReader = new FileReader()
      fileReader.onload = () => {
         setPreviewImage(fileReader.result as string)
      }
      fileReader.readAsDataURL(file)

      uploadMutation.mutate(file)
   }
   return (
      <div className="mx-auto max-w-2xl p-6">
         <h2 className="mb-4 text-xl font-semibold text-gray-800">Upload Image</h2>
         {uploadMutation.isPending && <p>Uploading...</p>}
         {uploadMutation.isError && <p className="text-red-500">Error: {uploadMutation.error?.message}</p>}
         {uploadMutation.isSuccess && <p className="text-green-500">Image uploaded successfully!</p>}
         <div className="image-preview">
            <form className="space-y-4" encType="multipart/form-data">
               <label htmlFor="image"> Image </label>
               <input id="image" type="file" accept="image/png, image/jpeg, image/webp" onChange={onUploaadImage} />
            </form>
            {previewImage && <img src={previewImage} alt="Image Preview" />}
         </div>
      </div>
   )
}
