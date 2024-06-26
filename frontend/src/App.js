import logo from './logo.png';
import './App.css';
import Navigation from './navigation';
import UserPanel from './userPanel/userPanel';
import React, {useContext, useState} from 'react';
import Draggable from 'react-draggable';
import * as Const from './const';
import UserContext from './contexts/userContext';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom'

import ChatBox from "./modules/chatBox";
import UserPage from './pages/user';
import HomePage from './pages/home';
import SearchingPage from './pages/searching';
import ItemPage from "./pages/itemPage";
import PostItem from "./pages/postItem";
import PostedItems from "./pages/postedItem";
import Transactions from "./pages/transactionPage";

import {Layout, Button, Modal} from 'antd';
const { Header, Content } = Layout;

function App() {
    const storedTokenSession = sessionStorage.getItem('authToken');
    const storedUsernameSession = sessionStorage.getItem('username');
    const storedUserIDSession = sessionStorage.getItem('userID');

    const storedTokenLocal = localStorage.getItem('authToken');
    const storedUsernameLocal = localStorage.getItem('username');
    const storedUserIDLocal = localStorage.getItem('userID');

    const initialToken = storedTokenSession || storedTokenLocal;
    const initialUsername = storedUsernameSession || storedUsernameLocal;
    const initialUserID = storedUserIDSession || storedUserIDLocal;

    const [selectedUserPanel, setSelectedUserPanel] = useState(Const.CLOSE);
    const [showChatBox, setShowChatBox] = useState(false);
    const [contextUsername, setContextUsername] = useState(initialUsername || '');
    const [contextUserID, setContextUserID] = useState(initialUserID || '');

  function handleOnUserPanelClick(panelName) {
    setSelectedUserPanel(panelName);
  }

  //close user panel
  function handleCloseUserPanelClick() {
    setSelectedUserPanel(Const.CLOSE);
  }

    function PrivateRoute({ children }) {
        let isAuthenticated = checkAuthFunction(); // replace with your auth check

        if (!isAuthenticated) {
            return <Navigate to="/login" />;
        }

        return children;
    }
    const toggleChatBox = () => {
        setShowChatBox(!showChatBox);
    };
    function checkAuthFunction() {
        // Check if an auth token exists in local or session storage
        const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');

        // Return true if a token exists, otherwise false
        return !!token;
    }

    return (
        <UserContext.Provider value={{ contextUsername, setContextUsername, contextUserID, setContextUserID }}>
            <Router>
                <Layout className="layout">
                    <Header style={{ display: 'flex', alignItems: 'center' }}>
                        <Navigation onUserPanelClick={handleOnUserPanelClick} />
                    </Header>
                    <Content>
                        {selectedUserPanel !== Const.CLOSE && <UserPanel onClose={handleCloseUserPanelClick} selectedUserPanel={selectedUserPanel} />}
                        <Routes>
                            <Route path="/user/:urlUserID" element={<UserPage />} />
                            <Route path="/home" element={<HomePage />} />
                            <Route path="/searching" element={<SearchingPage />} />
                            <Route path="/item/:itemID" element={<ItemPage/>} />
                            <Route path="/postitem" element={<PrivateRoute><PostItem/></PrivateRoute>} />
                            <Route path="/posted-item" element={<PrivateRoute><PostedItems/></PrivateRoute>} />
                            <Route path="/transactions" element={<PrivateRoute><Transactions/></PrivateRoute>} />
                            <Route path="/" element={<HomePage />} exact />
                        </Routes>
                        {
                            showChatBox && (
                               <ChatBox onClose={toggleChatBox}/>
                            )
                        }


                            {contextUsername!=='' &&
                                <Draggable>
                                    <Button className="chat-toggle-button" onClick={toggleChatBox}  style={{
                                        position: 'fixed',
                                        left: `${window.innerWidth - 200}px`,
                                        top: `${window.innerHeight - 100}px`
                                    }} type="primary" shape="round" size={'large'}>
                                        Chat
                                    </Button>
                                </Draggable>
                            }
                    </Content>
                </Layout>
            </Router>
        </UserContext.Provider>
    );
}

export default App;
