import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AiOutlineClose, AiOutlineFileImage, AiOutlineLogout, AiOutlineSearch, AiOutlineUser } from 'react-icons/ai';
import { GiHamburgerMenu } from 'react-icons/gi';
import { useDispatch, useSelector } from 'react-redux';
import { logout, updateUser } from '../../redux/authSlice';
import man from '../../assets/man.jpg';
import classes from './navbar.module.css';

const Navbar = () => {
    const { token, user } = useSelector((state) => state.auth);
    const [searchText, setSearchText] = useState("");
    const [state, setState] = useState({});
    const [photo, setPhoto] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [allUsers, setAllUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    // Mobile navigation state
    const [showMobileNav, setShowMobileNav] = useState(false);

    // Fetch all users
    useEffect(() => {
        const fetchAllUsers = async () => {
            try {
                const res = await fetch('https://mern-social-media-vt8f.onrender.com/user/findAll');
                const data = await res.json();
                setAllUsers(data);
            } catch (error) {
                console.error(error);
            }
        };
        fetchAllUsers();
    }, []);

    // Filter users based on search text
    useEffect(() => {
        setFilteredUsers(searchText ? allUsers.filter(user => user.username.includes(searchText)) : allUsers);
    }, [searchText, allUsers]);

    const handleLogout = () => {
        dispatch(logout());
        navigate('/login');
    };

    const handleState = (e) => {
        setState(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleShowForm = () => {
        setShowForm(true);
        setShowModal(false);
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        let filename = null;
        if (photo) {
            const formData = new FormData();
            filename = crypto.randomUUID() + photo.name;
            formData.append('filename', filename);
            formData.append('image', photo);

            await fetch('https://mern-social-media-vt8f.onrender.com/upload/image', {
                headers: { 'Authorization': `Bearer ${token}` },
                method: 'POST',
                body: formData
            });
        }

        try {
            const res = await fetch(`https://mern-social-media-vt8f.onrender.com/user/updateUser/${user._id}`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                method: 'PUT',
                body: JSON.stringify({ ...state, profileImg: filename })
            });

            const data = await res.json();
            setShowForm(false);
            dispatch(updateUser(data));
            window.location.reload();
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className={classes.container}>
            <div className={classes.wrapper}>
                <div className={classes.left}>
                    <Link to="/">Connectify</Link>
                </div>
                <div className={classes.center}>
                    <input
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        type="text"
                        placeholder="Search user..."
                    />
                    <AiOutlineSearch className={classes.searchIcon} />
                    {searchText && (
                        <div onClick={() => setSearchText("")} className={classes.allUsersContainer}>
                            {filteredUsers.map((user) => (
                                <Link to={`/profileDetail/${user._id}`} key={user._id}>
                                    <img src={man} alt="User" />
                                    <div className={classes.userData}>
                                        <span>{user.username}</span>
                                        <span>{user.bio?.slice(0, 10)}</span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
                <div className={classes.right}>
                    <Link to="/upload" style={{ textDecoration: 'none', color: 'inherit' }}>
                        Upload
                    </Link>
                    <div className={classes.icons}>
                        <AiOutlineUser />
                        <AiOutlineLogout onClick={handleLogout} />
                    </div>
                    <img
                        src={man}
                        alt="Profile"
                        className={classes.profileUserImg}
                        onClick={() => setShowModal(prev => !prev)}
                    />
                    {showModal && (
                        <div className={classes.modal}>
                            <span onClick={handleShowForm}>Update Profile</span>
                        </div>
                    )}
                </div>
                {showForm && (
                    <div className={classes.updateProfileForm} onClick={() => setShowForm(false)}>
                        <div className={classes.updateProfileWrapper} onClick={(e) => e.stopPropagation()}>
                            <h2>Update Profile</h2>
                            <form onSubmit={handleUpdateProfile}>
                                <input type="text" placeholder="Username" name="username" onChange={handleState} />
                                <input type="email" placeholder="Email" name="email" onChange={handleState} />
                                <input type="text" placeholder="Bio" name="bio" onChange={handleState} />
                                <input type="password" placeholder="Password" name="password" onChange={handleState} />
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '50%' }}>
                                    <label htmlFor="photo">Profile Picture <AiOutlineFileImage /></label>
                                    <input
                                        type="file"
                                        id="photo"
                                        style={{ display: 'none' }}
                                        onChange={(e) => setPhoto(e.target.files[0])}
                                    />
                                    {photo && <p>{photo.name}</p>}
                                </div>
                                <button type="submit">Update profile</button>
                            </form>
                            <AiOutlineClose onClick={() => setShowForm(false)} className={classes.removeIcon} />
                        </div>
                    </div>
                )}
            </div>
            <div className={classes.mobileNav}>
                {showMobileNav && (
                    <div className={classes.navigation}>
                        <div className={classes.left} onClick={() => setShowMobileNav(false)}>
                            <Link to="/">Connectify</Link>
                        </div>
                        <AiOutlineClose className={classes.mobileCloseIcon} onClick={() => setShowMobileNav(false)} />
                        <div className={classes.center}>
                            <input
                                value={searchText}
                                onChange={(e) => setSearchText(e.target.value)}
                                type="text"
                                placeholder="Search user..."
                            />
                            <AiOutlineSearch className={classes.searchIcon} />
                            {searchText && (
                                <div onClick={() => setSearchText("")} className={classes.allUsersContainer}>
                                    {filteredUsers.map((user) => (
                                        <Link to={`/profileDetail/${user._id}`} key={user._id} onClick={() => setShowMobileNav(false)}>
                                            <img src={user?.photo ? `https://mern-social-media-vt8f.onrender.com/images/${user.photo}` : man} alt="User" />
                                            <div className={classes.userData}>
                                                <span>{user.username}</span>
                                                <span>{user.bio?.slice(0, 10)}</span>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div className={classes.right}>
                            <Link to="/upload" style={{ textDecoration: 'none', color: 'inherit' }} onClick={() => setShowMobileNav(false)}>
                                Upload
                            </Link>
                            <div className={classes.icons} onClick={() => setShowMobileNav(false)}>
                                <AiOutlineUser onClick={() => navigate(`/profileDetail/${user._id}`)} />
                                <AiOutlineLogout onClick={handleLogout} />
                            </div>
                            <img
                                src={user?.profileImg ? `https://mern-social-media-vt8f.onrender.com/images/${user.profileImg}` : man}
                                alt="Profile"
                                className={classes.profileUserImg}
                                onClick={() => setShowModal(!showModal)}
                            />
                            {showModal && (
                                <div className={classes.modal}>
                                    <span onClick={handleShowForm}>Update Profile</span>
                                </div>
                            )}
                        </div>
                        {showForm && (
                            <div className={classes.updateProfileForm} onClick={() => setShowForm(false)}>
                                <div className={classes.updateProfileWrapper} onClick={(e) => e.stopPropagation()}>
                                    <h2>Update Profile</h2>
                                    <form onSubmit={handleUpdateProfile}>
                                        <input type="text" placeholder="Username" name="username" onChange={handleState} />
                                        <input type="email" placeholder="Email" name="email" onChange={handleState} />
                                        <input type="text" placeholder="Bio" name="bio" onChange={handleState} />
                                        <input type="password" placeholder="Password" name="password" onChange={handleState} />
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '50%' }}>
                                            <label htmlFor="photo">Profile Picture <AiOutlineFileImage /></label>
                                            <input
                                                type="file"
                                                id="photo"
                                                style={{ display: 'none' }}
                                                onChange={(e) => setPhoto(e.target.files[0])}
                                            />
                                            {photo && <p>{photo.name}</p>}
                                        </div>
                                        <button type="submit">Update profile</button>
                                    </form>
                                    <AiOutlineClose onClick={() => setShowForm(false)} className={classes.removeIcon} />
                                </div>
                            </div>
                        )}
                    </div>
                )}
                {!showMobileNav && (
                    <GiHamburgerMenu onClick={() => setShowMobileNav(prev => !prev)} className={classes.hamburgerIcon} />
                )}
            </div>
        </div>
    );
};

export default Navbar;
