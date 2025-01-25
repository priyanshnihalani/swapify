import Header from '../Header/Header'
import Footer from '../Footer/Footer'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBook, faBookOpen, faClose, faCoins, faEye, faPenAlt, faPenClip, faTrash, faTrashAlt } from '@fortawesome/free-solid-svg-icons'
import './UserViewProfile.css'
import { useEffect, useState } from 'react'
import imageCompression from 'browser-image-compression'
import { useForm } from 'react-hook-form'

function UserViewProfile() {
    const { register, handleSubmit, formState: { errors } } = useForm();

    const [profileImage, setProfileImage] = useState(null);
    const [smallprofileImage, setsmallProfileImage] = useState(null);
    const [data, setData] = useState(null)
    const [imageSrc, setImageSrc] = useState(null);
    const [profileCard, setProfileCard] = useState(false)
    const [profileResponse, setProfileResponse] = useState(false);
    const [skillProvide, setSkillProvide] = useState([""]);
    const [displayProvide, setDisplayProvide] = useState(false)

    const skillComponent = (index) => {
        return (
            <>
                <input type="text" name={`skill ${index + 1}`} className='outline-none border-2 w-full rounded-md p-2' placeholder={`Add Skill No: ${index + 1}`} {...register(`skill ${index + 1}`, { required: "Field cannot be placed empty" })} />

                <div className='text-red-600'>
                    {errors[`skill ${index + 1}`]?.message}
                </div>
            </>
        )
    }
    useEffect(() => {

        const name = localStorage.getItem('name');
        const encodedName = encodeURIComponent(name)
        async function collectData() {
            const response = await fetch(`http://localhost:3000/userviewprofile/${encodedName}`)
            const result = await response.json()
            console.log(result)
            setData(result)
            setImageSrc(result?.coverImage)
            setProfileImage(result?.profileImage)

        }

        collectData();
    }, [])

    async function handleCoverImage(event) {
        const file = event.target.files[0];
        if (file) {

            const options = {
                maxSizeMB: 500, // Limit to 1MB
                maxWidthOrHeight: 1024, // Resize if dimensions exceed 1024px
            };

            const compressedFile = await imageCompression(file, options)
            const reader = new FileReader();
            reader.readAsDataURL(compressedFile);

            reader.onload = async () => {
                const response = await fetch(`http://localhost:3000/uploadCover/${data._id}`, {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    method: 'PATCH',
                    body: JSON.stringify({ coverImage: reader.result }),
                })

                console.log(await response.json())
                setImageSrc(reader.result);
            }
        }
    }

    async function handleProfileChange(event) {
        const file = event.target.files[0];
        if (file) {

            const options = {
                maxSizeMB: 1024, // Limit to 1MB
                maxWidthOrHeight: 1920, // Resize if dimensions exceed 1024px
                useWebWorker: true
            };
            const compressedFile = await imageCompression(file, options)
            const reader = new FileReader();
            reader.readAsDataURL(compressedFile);

            reader.onload = () => {
                setsmallProfileImage(reader.result)
            }
        }
    }

    async function submit(profileData) {

        // console.log(data._id)
        localStorage.setItem('name', profileData.name)

        const response = await fetch(`http://localhost:3000/updateProfile/${data._id}`, {
            headers: {
                'Content-Type': 'application/json'
            },
            method: 'PATCH',
            body: JSON.stringify({
                profileImage: smallprofileImage,
                name: profileData.name,
                description: profileData.description
            })
        })

        const result = await response.json()
        alert(result.message)
        setProfileResponse(!profileResponse)
        setProfileCard(false)
    }

    function removeSkill(index) {
        setSkillProvide(prev => {
            return prev.filter((_, i) => i !== index)
        })
    }

    async function submitProvideSkills(skilldata) {
        console.log(data._id)
        const newData = Object.values(skilldata).map((value) => {
            return value
        })

        let finalData = [...data?.skillprovide, ...newData]
        const response = await fetch(`http://localhost:3000/skillprovide/${data._id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ skillprovide: finalData })
        })
        console.log(await response.json())
        setDisplayProvide(false)
    }

    return (
        <>
            <Header />
            {profileCard && <div className='p-6 w-[350px] bg-white shadow-lg rounded-lg z-10 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2'>
                <form className='space-y-6' onSubmit={handleSubmit(submit)}>
                    <label htmlFor="profile">
                        <div className='mx-auto shadow-lg rounded-full w-[120px] h-[120px] bg-gray-400 bg-cover border-4 border-white cursor-pointer' style={{ backgroundImage: imageSrc ? `url(${smallprofileImage})` : 'none' }}>
                        </div>
                    </label>
                    <input type="file" name="profile" onChange={(event) => handleProfileChange(event)} id="profile" className='hidden' />
                    <div className='space-y-3'>
                        <h1 className='text-xl font-semibold text-gray-700'>Name</h1>
                        <input type='text' name='name' {...register('name', { required: 'Name Field Cannot be Empty' })} className='border-2 border-gray-300 focus:ring-2 focus:ring-blue-400 rounded-lg p-2 w-full' defaultValue={data?.name} />
                        <div>
                            <h1 className='text-red-600'>{errors['name']?.message}</h1>
                        </div>
                    </div>
                    <div className='space-y-3'>
                        <h1 className='text-xl font-semibold text-gray-700'>Description</h1>
                        <textarea name='description' {...register('description')} className='w-full border-2 border-gray-300 focus:ring-2 focus:ring-blue-400 rounded-lg p-2' defaultValue={data?.description} rows={4} />
                    </div>
                    <div className='flex justify-between items-center space-x-4'>
                        <button type='button' className='px-4 py-2 text-white bg-gray-600 rounded-full hover:bg-gray-700' onClick={() => setProfileCard(false)}>Cancel</button>
                        <button type='submit' className='px-4 py-2 text-white bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full hover:opacity-90 transition-all duration-200'>Save</button>
                    </div>
                </form>
            </div>}

            <main className='space-y-10 px-6 py-8 min-h-screen bg-gray-50 font-jost'>
                <div className='relative shadow-md rounded-lg overflow-hidden'>
                    <div className='relative min-h-[250px] bg-gray-200 bg-cover' style={{ backgroundImage: imageSrc ? `url(${imageSrc})` : 'none' }}>
                        <label htmlFor="bg-file">
                            <FontAwesomeIcon icon={faPenClip} className='text-white absolute top-4 right-4 cursor-pointer' />
                        </label>
                        <input type='file' id='bg-file' className='hidden' onChange={(event) => handleCoverImage(event)} />
                        <div className='shadow-lg absolute -bottom-10 rounded-full w-[120px] h-[120px] bg-gray-400 bg-cover border-4 border-white left-6' style={{ backgroundImage: imageSrc ? `url(${profileImage})` : null }}></div>
                    </div>
                    <div className='min-h-[300px] pt-16 px-6'>
                        <h1 className='font-extrabold text-2xl text-gray-800'>{data?.name}</h1>
                        <p className='italic text-gray-500 mt-4'>{data?.description || "Welcome to my Swapify profile! Feel free to connect if we can collaborate."}</p>
                        <div className='flex mt-4 space-x-4 items-center'>
                            <div className='flex items-center text-gray-600'>
                                <FontAwesomeIcon icon={faCoins} className='text-yellow-500 text-sm' />
                                <span className='text-xs ml-2'>100</span>
                            </div>
                            <button className='bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-2 px-4 rounded-full hover:bg-blue-600' onClick={() => setProfileCard(true)}>Edit Profile</button>
                        </div>
                    </div>
                </div>

                <div className='shadow-md rounded-lg bg-white py-6'>
                    <h1 className='font-extrabold text-2xl text-gray-800 pl-6'>Analytics</h1>
                    <div className='flex justify-center py-10 space-x-16'>
                        <div className='flex items-center text-gray-600'>
                            <FontAwesomeIcon icon={faEye} className='text-xl' />
                            <div className='ml-4'>
                                <h6 className='font-bold'>21 profile views</h6>
                                <h6>Discover who viewed your profiles.</h6>
                            </div>
                        </div>
                        <div className='flex items-center text-gray-600'>
                            <FontAwesomeIcon icon={faBook} className='text-xl' />
                            <div className='ml-4'>
                                <h6 className='font-bold'>10 Things You Learn</h6>
                                <h6>Checkout the list of your tutors.</h6>
                            </div>
                        </div>
                        <div className='flex items-center text-gray-600'>
                            <FontAwesomeIcon icon={faBookOpen} className='text-xl' />
                            <div className='ml-4'>
                                <h6 className='font-bold'>20 people learn from you</h6>
                                <h6>See the person learnt by you.</h6>
                            </div>
                        </div>
                    </div>
                </div>

                <div className='relative shadow-md rounded-lg bg-white py-6'>
                    <h1 className='font-extrabold text-2xl text-gray-800 pl-6'>Skills</h1>

                    {displayProvide && <div className='absolute min-h-[200px] bg-white shadow-lg w-1/2 px-4 py-6 font-semibold' style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
                        <div className='flex justify-between'>
                            <h1>Add Skills You Want to Provide</h1>
                            <div className='cursor-pointer' onClick={() => setDisplayProvide(false)}>
                                <FontAwesomeIcon icon={faClose} />
                            </div>
                        </div>
                        <form onSubmit={handleSubmit(submitProvideSkills)}>
                            <div className='my-10 space-y-4'>
                                {skillProvide.map((_, index) => (
                                    <div key={index} className='flex space-x-4 items-center'>
                                        <div className='w-full'>
                                            {skillComponent(index)}
                                        </div>
                                        <div onClick={() => removeSkill(index)}>
                                            <FontAwesomeIcon icon={faTrashAlt} color='red' className='cursor-pointer' />
                                        </div>
                                    </div>
                                ))}

                            </div>
                            <div className='w-full absolute bottom-2 py-2'>
                                <div className='w-full flex justify-evenly'>
                                    <button type='button' className='border px-2 py-1' onClick={() => setSkillProvide(prev => [...prev, ""])}>Add Skill</button>
                                    <button type='submit' className='border px-2 py-1' >Save</button>
                                </div>
                            </div>
                        </form>
                    </div>}
                    <div className='flex flex-col justify-center items-center space-y-5 px-16'>
                        <div className='w-full shadow-md py-6 px-8'>
                            <div className='w-full flex justify-between'>
                                <div className='text-lg font-semibold'>Skills I Provide</div>
                                <div>
                                    <FontAwesomeIcon icon={faPenAlt} className='cursor-pointer' onClick={() => setDisplayProvide(true)} />
                                </div>
                            </div>
                            <div className='py-5 px-8'>
                                {data?.skillprovide.map((item, index) => (
                                    <div key={index} className='list-item'>
                                        {Object.values(item)}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className='w-full shadow-md flex justify-between items-center py-6 px-8'>
                            <div className='text-lg font-semibold'>Skills I Want</div>
                            <FontAwesomeIcon icon={faPenAlt} className='cursor-pointer' />
                        </div>
                    </div>
                </div>

                <div className='shadow-md rounded-lg bg-white py-6'>
                    <h1 className='font-extrabold text-2xl text-gray-800 pl-6'>History</h1>
                    <div className='px-8'>
                        <div className='flex justify-between items-center py-6'>
                            <div className='rounded-full min-h-[80px] w-[80px] bg-gray-400 border-white'>
                                {/* Profile Image */}
                            </div>
                            <div>
                                <h1 className='text-lg font-semibold'>Chirag Karamchandani</h1>
                                <p className='text-gray-500'>Student at Noble University Junagadh</p>
                            </div>
                            <div>
                                <h1 className='text-gray-700'>Date</h1>
                                <p className='text-gray-500'>11/11/24</p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </>
    )
}
export default UserViewProfile