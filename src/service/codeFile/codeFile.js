

// export const shareCode = async (formData) => {
//     try {
//         const response = await fetch("/api/folder/save", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json", // ✅ important
//       },
//       body: JSON.stringify(formData),       // ✅ convert to JSON
//     });
//         const data = await response.json();
//         if (!data.success) throw new Error(data.message || "Failed to save");
//         return data;
//     } catch(error){
//         throw error;
//     }
// } 
// export const getCodeById = async (shareId) => {
//   try {
//     const response = await fetch(`/api/folder/share/${shareId}`);
//     const data = await response.json();

//     if (!data.success) {
//       throw new Error(data.message || "Failed to fetch code file");
//     }

//     return data.data; // returns codeFile object
//   } catch (error) {
//     throw error;
//   }
// };

