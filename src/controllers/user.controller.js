import {asyncHandler} from "../utils/asyncHandler.js"
import {ApiError} from "../utils/apiErrorHandler.js"
import {User} from "../models/users.model.js"
const registerUser = asyncHandler(async (req, res)=> {
   // get user details from frontend
   // validation- check not empty
   // check if user already exists: username, email
   // check for images/avatar
   // upload to cloudinary
   // create user object- create entry in db
   // remove password and refresh token field from response
   // check for user creation
   // return res


   const {fullName, email, username, password}= req.body

   if([fullName, email, username, password].some((field)=> field?.trim()==="")){
      throw new ApiError(400, "All fields are required")
   }

   const existedUser= User.findOne({
      $or: [{username}, {email}]
   })

   if(existedUser){
      throw new ApiError(409, "User already exists")
   }

   const avatarLocalPath= req.files?.avatar[0]?.path;
   const coverImageLocalPath= req.files?.coverImage[0]?.path;

   if(!avatarLocalPath){
      throw new ApiError(400, "Avatar is required")
   }
})




export {registerUser}