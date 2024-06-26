import React, { useEffect, useState, useContext } from 'react'
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom'
import { Row, Col, Image, Button, Typography, Layout, Modal, Input, Tag, message, List, Carousel, Form, Select, Upload } from 'antd'
import { StarOutlined, StarFilled, UploadOutlined } from '@ant-design/icons'
import UserContext from "../contexts/userContext"
import categories from "../categories";
import fakeItems from "../fakedata/fakeItems"
import { type } from "@testing-library/user-event/dist/type"
const apiUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost'
const apiPort = process.env.REACT_APP_BACKEND_PORT || '8080'

const { Title, Text } = Typography

const { Content } = Layout

function ItemPage () {
    const { contextUsername, contextUserID } = useContext(UserContext)
    const [isOwner, setIsOwner] = useState(false)
    const [bids, setBids] = useState([])
    const { itemID } = useParams() // 从URL中读取itemID
    const [item, setItem] = useState(null)
    const [fileList, setFileList] = useState([])
    const [isFavorited, setIsFavorited] = useState(false)
    const [isModalVisible, setIsModalVisible] = useState(false)
    const [bidAmount, setBidAmount] = useState(0) // 用户输入的出价
    const [bidMessage, setBidMessage] = useState('') // 用户输入的出价
    const [editedItem, setEditedItem] = useState({ name: '', description: '' })
    const [isEditModalVisible, setIsEditModalVisible] = useState(false)
    const [userBid, setUserBid] = useState(0)
    const navigate = useNavigate()

    const location = useLocation()

    useEffect(() => {
        async function fetchData () {
            try {
                const response = await fetch(`${apiUrl}:${apiPort}/items/${itemID}`)
                const data = await response.json()

                if (response.ok) {
                    setItem(data)
                } else {
                    console.error('Failed to fetch item:', data.message)
                }
            } catch (error) {
                console.error('There was an error fetching the item:', error)
            }
        }
        fetchData()
    }, [itemID, contextUserID])

    useEffect(() => {
        if (item) {
            console.log(item)
            setIsFavorited(item.isFavorited)
            if (item.owner.username === contextUsername) {
                setIsOwner(true)
            } else {
                setIsOwner(false)
            }
            fetchBidsForItem()

        }
    }, [item, contextUsername])

    const fetchBidsForItem = async () => {

        try {
            const response = await fetch(`${apiUrl}:${apiPort}/asks/item/${itemID}`)
            if (response.ok) {
                const data = await response.json()
                setBids(data)
                const currentUserBid = data.find(bid => bid.user === contextUsername)
                console.log(data)
                if (currentUserBid) {
                    setUserBid(currentUserBid.price)
                }
            } else {
                const data = await response.json()
                console.error('Failed to fetch bids for item:', data.message)
            }
        } catch (error) {
            console.error('There was an error fetching the bids for the item:', error)
        }
    }

    const handleAcceptBid = async (bidID) => {
        try {
            const formData = new URLSearchParams()
            formData.append('ask_id', parseInt(bidID, 10))
            console.log(bidID)
            const response = await fetch(`${apiUrl}:${apiPort}/transaction`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: formData,
            })
            if (response.ok) {
                setBids("")
            } else {
                const data = await response.json()
                console.error('Failed to accept the bid:', data.message)
            }
        } catch (error) {
            console.error('There was an error accepting the bid:', error)
        }
    }

    const handleRejectBid = async (bidID) => {
        try {
            const response = await fetch(`${apiUrl}:${apiPort}/asks/${bidID}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
            })

            if (response.ok) {
                setBids(prevBids => prevBids.filter(bid => bid.ask_id !== bidID))
            } else {
                const data = await response.json()
                console.error('Failed to reject the bid:', data.message)
            }
        } catch (error) {
            console.error('There was an error rejecting the bid:', error)
        }
    }


    async function handleDeleteItem () {
        try {
            const response = await fetch(`${apiUrl}:${apiPort}/items/${itemID}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
            })

            if (response.ok) {
                alert("Item deleted successfully")
                navigate('/home')
            } else {
                const data = await response.json()
                console.error('Failed to delete the item:', data.message)
                alert("Failed to delete the item. Please try again later.")
            }
        } catch (error) {
            console.error('There was an error deleting the item:', error)
            alert("There was an error deleting the item. Please try again later.")
        }
        message.success("Item deleted successfully")
    }

    const handleOpenEditModal = () => {
        setIsEditModalVisible(true)
        setEditedItem({
            name: item.name,
            description: item.description,
            price: item.price,
            category: item.category
        })
    }

    const handleUploadChange = ({ fileList }) => {
        setFileList(fileList)
    }

    const handleCloseEditModal = () => {
        setIsEditModalVisible(false)
    }

    async function handleSaveChanges () {
        if (!editedItem.name || !editedItem.description || !editedItem.category || !editedItem.price) {
            message.error('All fields are required!')
            return
        }

        // Create a new FormData object for handling file uploads and form data
        const formData = new FormData()

        // Append the form data in the order as seen in the screenshot
        formData.append('name', editedItem.name)
        formData.append('category', editedItem.category)
        formData.append('description', editedItem.description)
        formData.append('price', editedItem.price)

        // Append the images; fileList should be an array of File objects
        fileList.forEach((file) => {
            formData.append('images', file.originFileObj)
        })


        const response = await fetch(`${apiUrl}:${apiPort}/items/${itemID}`, {
            method: 'PUT',
            body: formData,
        })

        if (response.ok) {
            message.success('Item edited successfully')
            handleCloseEditModal()
            navigate(`/item/${itemID}`)
        } else {
            const data = await response.json()
            console.error('Error from server:', data)
        }
    }


    const handleOpenModal = () => {
        if (!contextUserID) {
            alert("Please log in to continue.")
            return
        }
        setBidAmount(item.price.toString())
        setIsModalVisible(true)
    }


    const handleCloseModal = () => {
        setIsModalVisible(false)
        setBidAmount(0) // 清除输入框内容
    }

    const handleNavigationBuyer = async (buyername) => {
        try {
            const response = await fetch(`${apiUrl}:${apiPort}/user/byname/${buyername}`)
            if (response.ok) {
                const user = await response.json()
                console.log(user)
                navigate(`/user/${user.studentId}`)
            } else {
                throw new Error('User not found')
            }
        } catch (error) {
            console.error('Error fetching user:', error)
        }
    }

    const toggleFavorite = async () => {
        try {
            // 更新后端的收藏状态
            const response = await fetch(`${apiUrl}:${apiPort}/favorite`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userID: contextUserID,
                    itemID: itemID,
                }),
            })

            if (response.ok) {
                setIsFavorited(prevState => !prevState) // 切换收藏状态
            } else {
                // 处理错误
                const data = await response.json()
                console.error('Failed to update favorite status:', data.message)
            }
        } catch (error) {
            console.error('There was an error updating the favorite status:', error)
        }
    }

    const handleConfirmPurchase = async () => {
        try {
            // 使用URLSearchParams构造表单数据
            const formData = new URLSearchParams()
            formData.append('item_id', itemID)
            formData.append('buyer', contextUsername)
            formData.append('price', bidAmount)
            formData.append('message', bidMessage)

            const response = await fetch(`${apiUrl}:${apiPort}/asks`, {
                method: 'POST',
                // 设置头部为表单数据类型
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                // 发送表单数据作为请求主体
                body: formData,
            })

            if (response.ok) {
                setIsModalVisible(false)
            } else {
                const data = await response.json()
                console.error('Failed to purchase:', data.message)
            }
        } catch (error) {
            console.error('There was an error making the purchase:', error)
        }
    }



    function generateAmazonSearchURL (query) {
        return `https://www.amazon.com/s?k=${encodeURIComponent(query)}`
    }

    if (!item) return <p>Loading...</p>


    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Content>
                <Row justify="center" gutter={32} style={{ height: '100%', marginTop: "3%" }}>
                    <Col span={6}>
                        <Carousel autoplay>
                            {item.image.map((img, index) => (
                                <div key={index}>
                                    <Image width={400} src={img.url} />
                                </div>
                            ))}
                        </Carousel>
                    </Col>
                    <Col span={8}>
                        <Title level={2} style={{ display: 'flex', alignItems: 'center' }}>
                            {item.name}
                            {<span style={{ marginLeft: '10px' }}>
                                {
                                    contextUserID && (isFavorited ?
                                        <StarFilled style={{ color: 'gold', fontSize: '20px' }} onClick={toggleFavorite} /> :
                                        <StarOutlined style={{ fontSize: '20px' }} onClick={toggleFavorite} />)
                                }

                            </span>}
                        </Title>

                        <div style={{ marginBottom: '15px' }}>
                            <Tag color="blue">{item.category}</Tag>
                        </div>

                        <Text strong>Estimated Price: </Text><br />${item.price}<br /><br />
                        <Text strong>Description: </Text><br />{item.description}<br /><br />
                        <Text strong>Owned by: </Text><br /><Link to={`/user/${item.owner.studentId}`}>{item.owner.username}</Link><br /><br />
                        <Button
                            type="default"
                            onClick={() => window.open(generateAmazonSearchURL(item.name), '_blank')}
                        >
                            Search on Amazon
                        </Button>
                        <br /><br />
                        {!isOwner && item.status === "AVAILABLE" && (
                            <>
                                <Button type="primary" style={{ marginRight: '10px' }} onClick={handleOpenModal}>Buy</Button>
                                {contextUserID !== '' && userBid !== 0 && <Text>Your previous bid: ${userBid}</Text>}
                            </>
                        )}
                        {item.status === "SOLD" && (
                            <>
                                <Tag color="red" style={{ fontSize: '16px', padding: '5px 10px', borderRadius: '4px' }}>SOLD</Tag>
                            </>
                        )}
                        {isOwner && item.status === "AVAILABLE" && (
                            <div style={{ marginTop: '20px' }}>
                                <Title level={3}>All Bids</Title>
                                <List
                                    bordered
                                    dataSource={bids}
                                    renderItem={bid => (
                                        <List.Item>
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                                                <Text strong><span><Link onClick={() => { handleNavigationBuyer(bid.user) }}> {bid.user}</Link>: "{bid.message}" Price: ${bid.price}</span></Text>
                                                <div>
                                                    <Button type="primary" style={{ marginRight: '10px' }} onClick={() => handleAcceptBid(bid.ask_id)}>{bid.id}Accept</Button>
                                                    <Button type="default" danger onClick={() => handleRejectBid(bid.ask_id)}>Reject</Button>
                                                </div>
                                            </div>
                                        </List.Item>
                                    )}
                                />
                            </div>
                        )}

                        <Modal
                            title="Place your bid"
                            visible={isModalVisible}
                            onOk={handleConfirmPurchase}
                            onCancel={handleCloseModal}
                        >
                            <Input
                                type="number"
                                prefix="$"
                                placeholder="Enter your bid"
                                value={bidAmount}
                                onChange={(e) => setBidAmount(e.target.value)}
                            />
                            <Input
                                type="text"
                                placeholder="Enter your message"
                                value={bidMessage}
                                onChange={(e) => setBidMessage(e.target.value)}
                            />
                        </Modal>
                    </Col>
                    {
                        isOwner && item.status === "AVAILABLE" &&
                        <>
                            <Button onClick={handleOpenEditModal} style={{ marginRight: '10px' }}>Edit</Button>
                            <Button type="default" danger onClick={handleDeleteItem}>Delete</Button>
                        </>
                    }

                    <Modal
                        title="Edit Item Details"
                        visible={isEditModalVisible}
                        onOk={handleSaveChanges}
                        onCancel={handleCloseEditModal}
                    >
                        <Form layout="vertical">
                            <Form.Item label="Name" required>
                                <Input
                                    value={editedItem.name}
                                    onChange={(e) => setEditedItem(prev => ({ ...prev, name: e.target.value }))}
                                    placeholder="Name"
                                />
                            </Form.Item>

                            <Form.Item label="Description" required>
                                <Input.TextArea
                                    rows={4}
                                    value={editedItem.description}
                                    onChange={(e) => setEditedItem(prev => ({ ...prev, description: e.target.value }))}
                                    placeholder="Description"
                                />
                            </Form.Item>

                            <Form.Item label="Category" required>
                                <Select
                                    value={editedItem.category}
                                    onChange={(value) => setEditedItem(prev => ({ ...prev, category: value }))}
                                    placeholder="Category"
                                >
                                    {categories.map(cat => (
                                        <Select.Option key={cat.value} value={cat.value}>{cat.label}</Select.Option>
                                    ))}
                                </Select>
                            </Form.Item>

                            <Form.Item label="Estimated Price" required>
                                <Input
                                    value={editedItem.price}
                                    onChange={(e) => setEditedItem(prev => ({ ...prev, price: e.target.value }))}
                                    placeholder="Price"
                                />
                            </Form.Item>

                            <Form.Item label="Upload Image">
                                <Upload
                                    fileList={fileList}
                                    onChange={handleUploadChange}
                                    beforeUpload={() => false} // prevent auto uploading
                                >
                                    <Button icon={<UploadOutlined />}>Click to Upload</Button>
                                </Upload>
                            </Form.Item>

                        </Form>
                    </Modal>

                </Row>
            </Content>
        </Layout>
    )
}

export default ItemPage
