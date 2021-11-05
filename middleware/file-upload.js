const multer = require('multer');
const uuid = require('uuid')
const MIME_TYPE_MAP ={
    'image/png':'png',
    'image/jpg':'jpg',
    'image/jpeg': 'jpeg'

}

const fileUpload = multer({
    limit:500000,
    storage:multer.diskStorage({
        destination:(req,file,cb)=>{
            cb(null,'upload/images')
        },
        filename:(req,file,cb)=>{
            const ext = MIME_TYPE_MAP[file.mimetype];
            cb(null,uuid.v1()+"."+ext)
        },
        fileFilter:(req,file,cb)=>{
            const isValid = !!MIME_TYPE_MAP[file.mimetype]
            let error = isValid ? null: new Error('Invalid mime type.')
            cb(error,isValid)
        }

    })
})


module.exports = fileUpload;