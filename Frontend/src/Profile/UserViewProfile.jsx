import Header from '../Header/Header'
import Footer from '../Footer/Footer'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBook, faBookOpen, faClose, faCoins, faEye, faPenAlt, faPenClip, faTrash, faTrashAlt } from '@fortawesome/free-solid-svg-icons'
import './UserViewProfile.css'
import { useEffect, useState } from 'react'
import imageCompression from 'browser-image-compression'
import { useForm } from 'react-hook-form'
import history from '../assets/images/history.png'

function UserViewProfile() {
    const { register, handleSubmit, formState: { errors }, reset } = useForm();
    const [profileImage, setProfileImage] = useState(null);
    const [smallprofileImage, setsmallProfileImage] = useState(null);
    const [data, setData] = useState(null)
    const [imageSrc, setImageSrc] = useState(null);
    const [profileCard, setProfileCard] = useState(false)
    const [profileResponse, setProfileResponse] = useState(false);
    const [skillProvide, setSkillProvide] = useState([""]);
    const [displayProvide, setDisplayProvide] = useState(false)
    const [skillWant, setSkillWant] = useState([""]);
    const [displayWant, setDisplayWant] = useState(false);
    const [learnes, setLearnes] = useState([]);
    const [teaches, setTeaches] = useState([]);
    const [learnesteaches, setLearnesTeaches] = useState([]);
    const [chargeCard, setchargeCard] = useState(false);
    const [rate, setRate] = useState(1);

    const backendUrl = import.meta.env.REACT_APP_BACKEND_URL;

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

        const id = localStorage.getItem('id');

        async function collectData() {
            const response = await fetch(`${backendUrl}/userviewprofile/${id}`)
            const result = await response.json()
            console.log(result)
            setData(result)
            setImageSrc(`${backendUrl}${result?.coverImage}`)
            setProfileImage(result?.profileImage)
        }

        collectData();
    }, [setSkillProvide, setSkillProvide])

    useEffect(() => {
        if (data && data.learnes) {
            const fetchLearners = async () => {
                const learnersData = await Promise.all(data?.learnes.map(async (item) => {
                    const response = await fetch(`${backendUrl}/userviewprofile/${item.teacher}`);
                    const result = await response.json();
                    return { name: result.name, description: result.description, timeStamp: item.timeStamp, teacher: "teacher" };
                }));
                setLearnes(learnersData);
            };

            fetchLearners();
        }
    }, [data]);

    useEffect(() => {
        if (data && data.teaches) {
            const fetchTeachers = async () => {
                const teachersData = await Promise.all(data?.teaches.map(async (item) => {
                    const response = await fetch(`${backendUrl}/userviewprofile/${item.learner}`);
                    const result = await response.json();
                    return { profileImage: result.profileImage, name: result.name, description: result.description, timeStamp: item.timeStamp, learner: "learner" };
                }));
                setTeaches(teachersData);
            };

            fetchTeachers();
        }
    }, [data]);

    useEffect(() => {
        let mergedArray = [...learnes, ...teaches]?.map((item) => {
            const date = new Date(item.timeStamp);
            const day = date.getDate();
            const month = date.toLocaleString('default', { month: 'short' });
            const year = date.getFullYear();
            const completeTime = `${day} ${month} ${year}`;

            return { ...item, completeTime };
        });

        // Sorting before setting state
        mergedArray.sort((a, b) => new Date(a.timeStamp) - new Date(b.timeStamp));

        setLearnesTeaches(mergedArray);
        console.log(mergedArray);
    }, [learnes, teaches]);

    async function handleCoverImage(event) {
        const file = event.target.files[0];
        if (file) {
            const formData = new FormData();
            formData.append("coverImage", file); 
    
            try {
                const response = await fetch(`${backendUrl}/uploadCover/${data._id}`, {
                    method: "PATCH",
                    body: formData,
                });
    
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
    
                const result = await response.json();
                
                if (result.filePath) {
                    setImageSrc(`${backendUrl}${result.filePath}`);  // Note: no extra / needed
                }
    
            } catch (error) {
                console.error("Error uploading image:", error);
            }
        }
    }

    async function handleProfileChange(event) {
        const file = event.target.files[0];
        if (file) {

            const options = {
                maxSizeMB: 500, // Limit to 1MB
                maxWidthOrHeight: 1080, // Resize if dimensions exceed 1024px
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

        localStorage.setItem('name', profileData.name)

        const response = await fetch(`${backendUrl}/updateProfile/${data._id}`, {
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
        reset()
        window.location.reload();

    }

    function removeSkillProvide(index) {
        setSkillProvide(prev => {
            return prev.filter((_, i) => i !== index)
        })
    }

    function removeSkillWant(index) {
        setSkillWant(prev => {
            return prev.filter((_, i) => i !== index)
        })
    }

    async function submitProvideSkills(skilldata) {
        console.log(data._id)
        const newData = Object.values(skilldata).map((value) => value);

        const dataskill = Array.isArray(data?.skillprovide) ? [...data.skillprovide] : [];

        let finalData = [...dataskill, ...newData]
        const response = await fetch(`${backendUrl}/skillprovide/${data._id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ skillprovide: finalData })
        })
        console.log(await response.json())
        reset()
        setDisplayProvide(false)
        window.location.reload();

    }

    async function submitWantSkills(skilldata) {
        console.log(data._id);

        const newData = Object.values(skilldata).map((value) => value);

        const dataskill = Array.isArray(data?.skillwant) ? [...data.skillwant] : [];

        const finalData = [...dataskill, ...newData];

        console.log("Final Data Sent:", JSON.stringify({ skillwant: finalData }));

        try {
            const response = await fetch(`${backendUrl}/skillwant/${data._id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ skillwant: finalData }),
            });

            const result = await response.json();
            console.log("Response from Server:", result);

            if (!response.ok) {
                console.error("Server Error:", response.status, result);
            } else {
                reset()
                setDisplayWant(false);
                window.location.reload();
            }
        } catch (error) {
            console.error("Error during fetch:", error);
        }
    }


    async function handleCharges() {
        const response = await fetch(`${backendUrl}/charges/${data._id}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ rate })
        })

        const result = await response.json();
        if (result.message == "Data Updated Successfully") {
            setchargeCard(false)
        }
    }

    return (
        <div className="font-jost min-h-screen ">
            <Header />

            {/* Profile Edit Modal */}
            {profileCard && (
                <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
                    <div className="flex items-center justify-center min-h-screen p-4 text-center sm:p-0">
                        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>
                        <div className="relative inline-block w-full max-w-md p-4 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-lg">
                            <form className="space-y-4" onSubmit={handleSubmit(submit)}>
                                <label htmlFor="profile" className="block cursor-pointer">
                                    <div
                                        className="mx-auto w-24 h-24 sm:w-32 sm:h-32 rounded-full shadow-lg bg-gray-400 bg-cover border-4 border-white"
                                        style={{
                                            backgroundImage: smallprofileImage
                                                ? `url("${smallprofileImage}")` // Ensure proper formatting
                                                : "none",
                                            backgroundSize: "cover", // Ensure image fills the div
                                            backgroundPosition: "center", // Center the image
                                        }}></div>
                                </label>
                                <input type="file" id="profile" className="hidden" onChange={handleProfileChange} />

                                <div className="space-y-2">
                                    <h1 className="text-lg sm:text-xl font-semibold text-gray-700">Name</h1>
                                    <input
                                        type="text"
                                        {...register('name', { required: 'Name Field Cannot be Empty' })}
                                        className="w-full p-2 border-2 rounded-lg focus:ring-2 focus:ring-blue-400"
                                        defaultValue={data?.name}
                                    />
                                    {errors['name']?.message && (
                                        <p className="text-red-600 text-sm">{errors['name'].message}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <h1 className="text-lg sm:text-xl font-semibold text-gray-700">Description</h1>
                                    <textarea
                                        {...register('description')}
                                        className="w-full p-2 border-2 rounded-lg focus:ring-2 focus:ring-blue-400"
                                        rows="4"
                                        defaultValue={data?.description}
                                    />
                                </div>

                                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                                    <button
                                        type="button"
                                        className="w-full sm:w-1/2 px-4 py-2 text-white bg-gradient-to-r to-[#252535] from-[#6C6C9B] rounded-full"
                                        onClick={() => setProfileCard(false)}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="w-full sm:w-1/2 px-4 py-2 text-white bg-gradient-to-r from-[#252535] to-[#6C6C9B] rounded-full hover:opacity-90"
                                    >
                                        Save
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {
                chargeCard && (
                    <div className='bg-white flex flex-col z-20 font-jost w-1/4 h-[200px] px-10 absolute top-[50%] left-[50%] shadow-lg shadow-[#252535] rounded-xl space-y-6 py-4' style={{ transform: "translate(-50%, -50%)" }}>
                        <div className='flex justify-between'>
                            <p>Min: 1</p>
                            <p>Max: 5</p>
                        </div>

                        <div
                            className="border-2 rounded-md w-full flex justify-between my-auto items-center"

                        >
                            <button
                                onClick={() => setRate(prev => (prev > 1 ? prev - 1 : prev))}
                                className="bg-[#6C6C9B] text-white px-4 py-2 rounded text-lg font-semibold hover:bg-[#5A5A87] transition duration-300"
                            >
                                -
                            </button>

                            <p className="text-2xl font-bold text-[#6C6C9B]">{rate}</p>

                            <button
                                onClick={() => setRate(prev => (prev < 5 ? prev + 1 : prev))}
                                className="bg-[#6C6C9B] text-white px-4 py-2 rounded text-lg font-semibold hover:bg-[#5A5A87] transition duration-300"
                            >
                                +
                            </button>

                        </div>

                        <div className='flex space-x-6'>
                            <button className='w-full bg-[#252535] text-white px-4 py-2 rounded' onClick={handleCharges}>Set</button>
                            <button className='w-full bg-[#252535] text-white px-4 py-2 rounded' onClick={() => setchargeCard(false)}>Cancel</button>
                        </div>


                    </div>

                )
            }
            {/* Main Content */}
            <main className="min-h-screen mx-auto px-4 sm:px-6 lg:px-40 py-6 space-y-6">
                {/* Profile Header */}
                <div className="bg-gradient-to-r from-[#252535] to-[#6C6C9B] p-1 rounded-xl">
                    <div className="bg-white rounded-lg overflow-hidden shadow-md pb-4">
                        <div className='z-40 shadow-lg bg-white flex justify-between px-10 py-4'>
                            <div className="flex items-center text-gray-600 space-x-2">
                                <p className='font-bold'>Your Balance:</p>
                                <FontAwesomeIcon icon={faCoins} className="text-yellow-500" />
                                <span className="ml-2">{data?.coins}</span>
                            </div>

                            <div className="flex items-center text-gray-600 space-x-2">
                                <p className='font-bold'>Your Charges:</p>
                                <FontAwesomeIcon icon={faCoins} className="text-yellow-500" />
                                <span className="ml-2">{data?.charges} / minute</span>
                            </div>
                        </div>
                        <div className="relative">
                            <div className="h-48 sm:h-64 md:h-60 bg-gray-200 bg-cover bg-center"
                                style={{ backgroundImage: imageSrc ? `url(${imageSrc})` : 'none' }}>
                                <label htmlFor="bg-file" className="absolute top-4 right-4 cursor-pointer">
                                    <FontAwesomeIcon icon={faPenClip} className="bg-white p-3 rounded-full shadow-md text-blue-900" />
                                </label>
                                <form encType='multipart/form-data'>
                                    <input type="file" id="bg-file" className="hidden" name="coverImage" onChange={handleCoverImage} />
                                </form>
                            </div>
                            <div className="absolute -bottom-16 left-4 sm:left-8">
                                <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gray-400 bg-cover border-4 border-white shadow-lg"
                                    style={{ backgroundImage: profileImage ? `url(${profileImage})` : 'none' }}>
                                </div>
                            </div>
                        </div>

                        <div className="border-t-2 border-gray-700 pt-20 sm:pt-24 px-4 sm:px-8 pb-6">
                            <h1 className="text-xl sm:text-2xl font-bold text-gray-800">{data?.name}</h1>
                            <p className="mt-2 text-gray-600 italic">{data?.description || "Welcome to my Swapify profile!"}</p>
                            <div className="mt-4 flex flex-wrap gap-4">

                                <button
                                    onClick={() => setProfileCard(true)}
                                    className="px-4 py-2 bg-gradient-to-r from-[#252535] to-[#6C6C9B] text-white rounded-full hover:opacity-90"
                                >
                                    Edit Profile
                                </button>
                                <button
                                    onClick={() => setchargeCard(true)}
                                    className="px-4 py-2 bg-gradient-to-r from-[#252535] to-[#6C6C9B] text-white rounded-full hover:opacity-90"
                                >
                                    Set Charges
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Analytics Section */}
                <div className="bg-gradient-to-r from-[#252535] to-[#6C6C9B] p-1 rounded-xl">
                    <div className="bg-white rounded-lg shadow-md p-8">
                        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-6">Analytics</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="flex items-start space-x-4">

                                <FontAwesomeIcon icon={faEye} className="text-xl mt-1" />

                                <div>
                                    <h3 className="font-semibold">{data?.views?.length || 0} profile views</h3>
                                    <p className="text-sm text-gray-600">Discover who viewed your profiles.</p>
                                </div>
                            </div>
                            <div className="flex items-start space-x-4">
                                <FontAwesomeIcon icon={faBook} className="text-xl mt-1" />
                                <div>
                                    <h3 className="font-semibold">{data?.learnes?.length || 0} Things You Learn</h3>
                                    <p className="text-sm text-gray-600">Checkout the list of your tutors.</p>
                                </div>
                            </div>
                            <div className="flex items-start space-x-4">
                                <FontAwesomeIcon icon={faBookOpen} className="text-xl mt-1" />
                                <div>
                                    <h3 className="font-semibold">{data?.teaches?.length || 0} people learn from you</h3>
                                    <p className="text-sm text-gray-600">See the person learnt by you.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Skills Section */}
                <div className="bg-gradient-to-r from-[#252535] to-[#6C6C9B] p-1 rounded-xl">
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-6">Skills</h2>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Skills I Provide */}
                            <div className="bg-white shadow rounded-lg p-6">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-semibold">Skills I Provide</h3>
                                    <button onClick={() => setDisplayProvide(true)}>
                                        <FontAwesomeIcon icon={faPenAlt} className="text-gray-600 hover:text-gray-800" />
                                    </button>
                                </div>
                                <ul className="space-y-2">
                                    {data?.skillprovide?.map((item, index) => (
                                        <li key={index} className="ml-4 list-disc text-gray-600">
                                            {Object.values(item)}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Skills I Want */}
                            <div className="bg-white shadow rounded-lg p-6">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-semibold">Skills I Want</h3>
                                    <button onClick={() => setDisplayWant(true)}>
                                        <FontAwesomeIcon icon={faPenAlt} className="text-gray-600 hover:text-gray-800" />
                                    </button>
                                </div>
                                <ul className="space-y-2">
                                    {data?.skillwant?.map((item, index) => (
                                        <li key={index} className="ml-4 list-disc text-gray-600">
                                            {Object.values(item)}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>

                {/* History Section */}
                <div className="bg-gradient-to-r from-[#252535] to-[#6C6C9B] p-1 rounded-xl">
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-6">History</h2>
                        {learnesteaches.length > 0 ? <div className="space-y-4">
                            {learnesteaches.map((item, index) => (
                                <div key={index} className='flex justify-between items-center border-b py-4'>
                                    <div>
                                        <img src={item.profileImage} className='w-[50px] h-[50px] rounded-full shadow' />
                                    </div>
                                    <div>
                                        <p>{item.name}</p>
                                        <p>{item.description}</p>
                                    </div>
                                    <div>
                                        <p>{item.learner || item.teacher}</p>
                                    </div>
                                    <div>
                                        <p>{item.completeTime}</p>
                                    </div>
                                </div>
                            ))}
                        </div> :
                            <>
                                <img src={history} alt="no-history-image" className='w-1/4 mx-auto'/>
                            </>
                        }
                    </div>
                </div>
            </main>

            {/* Skills Modals */}
            {(displayProvide || displayWant) && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen p-4">
                        <div className="fixed inset-0 bg-gray-500 bg-opacity-75"></div>
                        <div className="relative w-full max-w-lg p-6 bg-white rounded-lg shadow-xl">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-lg font-semibold">
                                    {displayProvide ? 'Add Skills You Want to Provide' : 'Add Skills You Want to Learn'}
                                </h3>
                                <button
                                    onClick={() => displayProvide ? setDisplayProvide(false) : setDisplayWant(false)}
                                    className="text-gray-500 hover:text-gray-700"
                                >
                                    <FontAwesomeIcon icon={faClose} />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit(displayProvide ? submitProvideSkills : submitWantSkills)}>
                                <div className="space-y-4 max-h-[60vh] overflow-y-auto">
                                    {(displayProvide ? skillProvide : skillWant).map((_, index) => (
                                        <div key={index} className="flex items-center gap-4">
                                            <div className="flex-grow">
                                                {skillComponent(index)}
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => displayProvide ? removeSkillProvide(index) : removeSkillWant(index)}
                                                className="text-red-500 hover:text-red-700"
                                            >
                                                <FontAwesomeIcon icon={faTrashAlt} />
                                            </button>
                                        </div>
                                    ))}
                                </div>

                                <div className="flex justify-between mt-6 pt-4 border-t">
                                    <button
                                        type="button"
                                        className="px-4 py-2 text-gray-700 border rounded-lg hover:bg-gray-50"
                                        onClick={() => displayProvide
                                            ? setSkillProvide(prev => [...prev, ""])
                                            : setSkillWant(prev => [...prev, ""])
                                        }
                                    >
                                        Add Skill
                                    </button>
                                    <div className='bg-gradient-to-r from-[#252535] to-[#6C6C9B] rounded-lg p-[0.12rem]'>
                                        <button
                                            type="submit"
                                            className="px-4 py-2 bg-white  rounded-md hover:bg-blue-600"
                                        >
                                            Save
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            <Footer />
        </div>
    )
}
export default UserViewProfile