import { useState } from "react";
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";
import { app } from "../firebase.js";

import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

const PostVacany = () => {
  const [files, setFiles] = useState([]);
  //const [progress, setProgress] = useState(0);
  const[error,setError] =useState(false);
  const[loading,setLoading]=useState(false);
  const [formData, setFormData] = useState({ imageUrls: [] ,
    name:"",
    city:"",
    description:"",
    address:"",
    furnished:0,
    amenities:"",
    Totalrent:"",
    Totaldeposit:"",
    brokerage:"",
    availablefrom:"",
    contact:"",
    postby:""


  });

  const [imageUploadError, setImageUploadError] = useState(false);
  const [uploading, setUploading] = useState(false);
  const {currentUser}=useSelector((state)=>state.user);
  const navigate=useNavigate();
  
  console.log(formData);
  const handleImageSubmit = (e) => {
    if (files.length > 0 && files.length + formData.imageUrls.length<7) {
      setUploading(true);
      setImageUploadError(false);
      //array length
      const promises = [];

      for (let i = 0; i < files.length; i++) {
        promises.push(storeImage(files[i]));
      }
      Promise.all(promises)
        .then((urls) => {
          setFormData({
            ...formData,
            imageUrls: formData.imageUrls.concat(urls),
          }); //keeping current form data and updating image urls from fiebase

          setImageUploadError(false);
          setUploading(false);
        })
        .catch((err) => {
          setImageUploadError("Image Upload failed.");
          setUploading(false);
        });
    } else {
      if(files.length==0)
      {setImageUploadError("Please select  an  image to upload.");
      setUploading(false);
      }
      else{
        setImageUploadError("Maximum 6 images allowed.");
        setUploading(false);
      }
    }
  };
  const storeImage = async (file) => {
    return new Promise((resolve, reject) => {
      const storage = getStorage(app);
      const fileName = new Date().getTime() + file.name; //2 files can have same name so to differentiate add with timestamps
      const storageRef = ref(storage, fileName);
      const uploadTask = uploadBytesResumable(storageRef, file);
      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log("Upload is " + progress + "% done");
        },
        (error) => {
          reject(error);
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            resolve(downloadURL); //bring back url
          });
        }
      );
    });
  };

  const handleRemoveImage =  (index) => {
    setFormData({
      ...formData,
      imageUrls: formData.imageUrls.filter((_,i) => i !== index),
    });
  };
  const handleChange=(e)=>{
    if(e.target.id==="furnished")
      {
        setFormData({
          ...formData,
          [e.target.id]:e.target.checked,
        })
      }
    if(e.target.type=="number"||e.target.type=="text"||e.target.type=="textarea"||e.target.type=="date")
      {
        setFormData({
          ...formData,
          [e.target.id]:e.target.value,
        })
      }
      else if (e.target.id === "gender") { // Handle gender separately
        setFormData({
          ...formData,
          gender: e.target.value, // Update gender field directly
        });
      }

  }
  const handleSubmit=async(e)=>{
    e.preventDefault();
    try {
      if (formData.imageUrls.length < 1)
        return setError("You must upload at least one image");

    

      setLoading(true);
      setError(false);

      const res = await fetch("/api/post/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          userRef: currentUser._id,
        }),
      });
      const data = await res.json();
      setLoading(false);
      if (data.success === false) {
        setError(data.message);
        return;
      }

      navigate(`/post/${data._id}`);
    } catch (error) {
      setError(error.message);
      setLoading(false);
    }


  };

  return (
    <main className="p-3 max-w-4xl mx-auto items-start">
      <h1 className="text-3xl font-semibold text-center my-7 text-cyan-900">
        POST A VACANCY
      </h1>
      <form onSubmit={handleSubmit}className="flex flex-col sm:flex-row gap-4 p-1 my-2">
        <div className="flex flex-col flex-1 gap-4">
          <input
            type="text"
            placeholder="Vacancy Type (eg: 1 Twin sharing Vacancy)"
            className="border p-3 rounded-lg"
            id="name"
            maxLength="62"
            minLength="10"
            required
            onChange={handleChange}
            value={formData.name}
          />
            <input
            type="text"
            placeholder="City"
            className="border p-3 rounded-lg"
            id="city"
           
            required
            onChange={handleChange}
            value={formData.city}
          />
          {/* <label htmlFor="gender" className="block text-sm font-medium text-gray-700">
          Select Gender:
        </label> */}
        
        <div className="flex  gap-4 flex-1 items-center">
                 <p>Gender:</p>
                 <select
          id="gender"
          className="mt-1 block w-full p-3 border rounded-lg  focus:border-indigo-500 sm:text-sm appearance-none"
          onChange={handleChange}
          value={formData.gender}
        >
          <option value="">Select an option</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
          
        </select>
          
          </div>
        
          <textarea
            placeholder="Description"
            className="border p-3 rounded-lg"
            id="description"
            required
            onChange={handleChange}
            value={formData.description}
          />
          <textarea
            placeholder="Address"
            className="border p-3 rounded-lg"
            id="address"
            required
            onChange={handleChange}
            value={formData.address}
          />
          <div className="flex gap-6 flex-wrap">
            <div className="flex gap-2 items-center">
              <input type="checkbox" id="furnished" className="w-5" onChange={handleChange} checked={formData.furnished}/>
              <span>Furnished</span>
            </div>
          </div>
          <input
            type="text"
            placeholder="Amenities"
            className="border p-3 rounded-lg"
            id="amenities"
            required
            onChange={handleChange}
            value={formData.amenities}
          />
          <div className="flex flex-wrap gap-6">
            <div className="flex items-center gap-2">
              <input
                type="number"
                id="Totalrent"
                placeholder="Total Rent"
                min="50"
                max="10000000"
                required
                className="p-3 border border-gray-300 rounded-lg"
                onChange={handleChange}
                value={formData.Totalrent}
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                id="Totaldeposit"
                placeholder="Total Deposit"
                min="50"
                max="10000000"
                required
                className="p-3 border border-gray-300 rounded-lg"
                onChange={handleChange}
                value={formData.Totaldeposit}
              />
            </div>
          </div>
          <input
            type="text"
            placeholder="Brokerage"
            className="border p-3 rounded-lg"
            id="brokerage"
            required
            onChange={handleChange}
            value={formData.brokerage}
          />

         
          
        </div>

        <div className="flex flex-col gap-4 flex-1">
       <div className="flex flex-row gap-2 justify-between items-center ">
                 <p>Available From: </p>
           <input
            type="date"
            placeholder="Available from: "
            className="mt-1 block w-60 p-3 border rounded-lg "
            id="availablefrom"
            required
            onChange={handleChange}
            value={formData.availablefrom}
          />
         </div>
         <input
            type="text"
            placeholder="Your Name"
            className="border p-3 rounded-lg"
            id="postby"
            required
            onChange={handleChange}
            value={formData.postby}
          />
        <input
            type="text"
            placeholder="Your Contact Details"
            className="border p-3 rounded-lg"
            id="contact"
            required
            onChange={handleChange}
            value={formData.contact}
          />
          <p className="font-semibold">
            Images:
            <span className="font-normal text-gray-600 ml-2">
              The first image will be the cover for your post (Max limit: 6
              Images)
            </span>
          </p>
          <div className="flex gap-4 items-center">
            <input
              onChange={(e) => setFiles(e.target.files)}
              className="p-3 border border-gray-300 rounded w-full"
              type="file"
              id="images"
              accept="image/*"
              multiple
            />
            <button
              disabled={uploading}
              onClick={handleImageSubmit}
              type="button"
              className="p-3 text-white border bg-green-700 rounded uppercase hover:shadow-lg disabled:opacity-80"
            >
              {uploading? "Uploading...": "Upload"}

            </button>
          </div>
          <p className="text-red-700">{imageUploadError && imageUploadError}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
            {formData.imageUrls.length > 0 &&
              formData.imageUrls.map((url, index) => (
                <div
                  key={url}
                  alt="post"
                  className="sm:flex-row justify-between gap-4 p-3 border  rounded-lg items-center"
                >
                  <img
                    src={url}
                    alt="post image"
                    className="w-20 h-20 object-contain rounded-lg"
                  />
                  <button
                    onClick={() => handleRemoveImage(index)}
                    type="button"
                    className=" my-2 p-2  border border-red-700 text-red-700 rounded-lg hover:opacity-75"
                  >
                    DELETE
                  </button>
                </div>
              ))}
          </div>

          <div className="text-center flex flex-col gap-4">
            <button
              disabled={loading||uploading}
              type="submit"
              className="bg-cyan-700  p-3 rounded-lg uppercase hover:opacity-80 text-white "
            >
              {loading? "Posting..":"Post Vacancy"}
            </button>
            {error && <p className="text-red-700 text-sm">{error} </p>}
          </div>
        </div>
      </form>
    </main>
  );
};

export default PostVacany;
