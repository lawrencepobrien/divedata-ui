import './LandingPage.css'

import TextInput from '../../components/Connected/TextInput/TextInput'

import { authApi } from '../api/auth';

function LandingPage(): JSX.Element {
    let email: string = '';
    let password: string = '';

    return (
        <>
        <p>Welcome to DiveData</p>
        <TextInput label='email:' onChange={(e) => { email = e.target.value; }}/>
        <TextInput label='password:' onChange={(e) => { password = e.target.value; }}/>
        <button onClick={() => {authApi.login(email, password)}}>
            Log in
        </button>
        </>
    )
}

export default LandingPage
