// import { useState } from 'react'
// import { useGoogleLogin } from '@react-oauth/google'

// interface DriveFile {
//   id: string
//   name: string
//   mimeType: string
// }

// export function useDriveFilePicker() {
//   const [selectedDriveFiles, setSelectedDriveFiles] = useState<DriveFile[]>([])

//   const login = useGoogleLogin({
//     onSuccess: (tokenResponse) => {
//       // Load the picker API
//       const script = document.createElement('script')
//       script.src = 'https://apis.google.com/js/api.js'
//       script.onload = () => {
//         window.gapi.load('picker', () => {
//           const picker = new google.picker.PickerBuilder()
//             .addView(google.picker.ViewId.DOCS)
//             .setOAuthToken(tokenResponse.access_token)
//             .setCallback((data: any) => {
//               if (data[google.picker.Response.ACTION] === google.picker.Action.PICKED) {
//                 const docs = data[google.picker.Response.DOCUMENTS]
//                 setSelectedDriveFiles(docs)
//               }
//             })
//             .build()
//           picker.setVisible(true)
//         })
//       }
//       document.body.appendChild(script)
//     },
//     scope: 'https://www.googleapis.com/auth/drive.file',
//   })

//   return { openPicker: login, selectedDriveFiles }
// }