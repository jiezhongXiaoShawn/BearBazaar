import React, { useContext, useState } from 'react'
import UserContext from '../contexts/userContext'
import { Button, Input, message, Form, Alert, Upload, Layout, Row, Col, Select } from 'antd'
import { UploadOutlined } from '@ant-design/icons'
import TextArea from "antd/es/input/TextArea"
import { useNavigate } from "react-router-dom"
import categories from "../categories";

const apiUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost' // 默认值为'http://www.dijkstraliu.com'
const apiPort = process.env.REACT_APP_BACKEND_PORT || '8080' // 默认值为'5000'

const { Content } = Layout
function PostItem () {
  const { contextUsername, contextUserID } = useContext(UserContext)

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('')
  const [price, setPrice] = useState('')
  const [error, setError] = useState(null)
  const [fileList, setFileList] = useState([])

  const { Option } = Select
  const navigate = useNavigate()
  async function handleNewItem () {
    if (!name || !description || !category || !price) {
      message.error('All fields are required!')
      return
    }

    // Create a new FormData object for handling file uploads and form data
    const formData = new FormData()

    // Append the form data in the order as seen in the screenshot
    formData.append('owner', contextUsername)
    formData.append('name', name)
    formData.append('category', category)
    formData.append('description', description)
    formData.append('price', price)

    // Append the images; fileList should be an array of File objects
    fileList.forEach((file) => {
      formData.append('images', file.originFileObj)
    })


    const response = await fetch(`${apiUrl}:${apiPort}/items`, {
      method: 'POST',
      body: formData,
    })

    if (response.ok) {
      message.success('Item added successfully')
      navigate('/home')
    } else {
      const data = await response.json()
      setError(data.message || 'An error occurred while adding the item.')
      console.error('Error from server:', data)
    }
  }

  const handleUploadChange = ({ fileList }) => {
    setFileList(fileList)
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Content>
        {error && <Alert message={error} type="error" showIcon closable />}
        <Row justify="center" gutter={32} style={{ height: '100%', marginTop: "3%" }}>
          <Col span={12}>
            <Form layout="vertical">
              <Form.Item label="Item Name" required>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" />
              </Form.Item>
              <Form.Item label="Description" required>
                <TextArea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description" />
              </Form.Item>
              <Form.Item label="Category" required>
                <Select
                    value={category}
                    onChange={setCategory} // Simplified for brevity
                    placeholder="Category"
                >
                  {categories.map(cat => (
                      <Select.Option key={cat.value} value={cat.value}>
                        {cat.label}
                      </Select.Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item label="Estimated Price" required>
                <Input value={price} onChange={(e) => setPrice(e.target.value)} placeholder="Price" />
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
              <Form.Item>
                <Button type="primary" onClick={handleNewItem}>
                  Add Item
                </Button>
              </Form.Item>
            </Form>
          </Col>
        </Row>
      </Content>
    </Layout>
  )
}
export default PostItem
