import { useState } from 'react'

export default function Upload() {
   const [previewImage, setPreviewImage] = useState('')
   function onUploaadImage(e) {
      const fileReader = new FileReader()
      fileReader.onload = () => {
         // fileReader.result is already a full data URL, e.g. "data:image/png;base64,...."
         setPreviewImage(fileReader.result as string)
      }
      fileReader.readAsDataURL(e.target.files[0])
   }
   return (
      <div>
         <form encType="multipart/form-data">
            <label htmlFor="image"> Image </label>
            <input id="image" type="file" accept="image/*" onChange={onUploaadImage} />
         </form>
         <div className="image-preview">
            <img src={previewImage} alt="Image Preview" />
         </div>
      </div>
   )
}
