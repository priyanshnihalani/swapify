import notfound from '../assets/images/notfound.png'

function NotFound() {
    return (
        <div className='flex w-full min-h-screen justify-center items-center'>
            <img loading='lazy' src={notfound} alt="404 Not Found" className='w-1/2 h-1/2' />
        </div>
    )
}
export default NotFound;