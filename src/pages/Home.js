import React, { useState } from 'react';
import { v4 as uuidV4 } from 'uuid';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const Home = () => {
    const navigate = useNavigate();

    const [roomId, setRoomId] = useState('');
    const [username, setUsername] = useState('');

    const createNewRoom = (e) => {
        e.preventDefault();
        const id = uuidV4();
        setRoomId(id);
        toast.success('Created a new room');
    };

    const joinRoom = () => {
        if (!roomId || !username) {
            toast.error('ROOM ID & username is required');
            return;
        }

        // Redirect
        navigate(`/editor/${roomId}`, {
            state: {
                username,
            },
        });
    };

    const handleInputEnter = (e) => {
        if (e.code === 'Enter') {
            joinRoom();
        }
    };

    return (
        <div className='homePageWrapper'>
            <div className='formWrapper'>
                <img
                    className="homePageLogo"
                    src="/code.png"
                    alt="code-pulse-logo"
                />
                <h4 className='mainLabel'>Paste invitation ID</h4>
                <div className='inputGroup'>
                    <input 
                        type='text' 
                        className='inputBox' 
                        placeholder='Room ID' 
                        onChange={(e) => setRoomId(e.target.value)} 
                        value={roomId}
                        onKeyUp={handleInputEnter}
                    />
                    
                    <input 
                        type='text' 
                        className='inputBox' 
                        placeholder='USERNAME' 
                        onChange={(e) => setUsername(e.target.value)} 
                        value={username}
                        onKeyUp={handleInputEnter}
                    />
                    
                    <button className='btn joinBtn' onClick={joinRoom}>
                        Join
                    </button>
                    <span className='createInfo'>
                        If you do not have an invitation, then create &nbsp;
                        <button 
                            onClick={createNewRoom} 
                            className='createNewBtn'
                        >
                            new Room 
                        </button>
                    </span>
                </div>
            </div>
            <footer>
                <h4>
                    Built by 💛 &nbsp; by &nbsp;
                    <a href='https://github.com/Dhirajsharma2060'>Aryan@2060</a>
                </h4>
            </footer>
        </div>
    );
};

export default Home;