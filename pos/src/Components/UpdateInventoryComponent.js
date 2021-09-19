import React, { useState, useEffect } from 'react'
import { Nav, NavItem, NavLink, TabContent, TabPane } from 'reactstrap'
import { db } from '../firebase'
import classnames from 'classnames'
import AddProductsComponent from './AddProductsComponent'

export default function UpdateInventoryComponent() {
    const [isComplete, setIsComplete] = useState(false)
    const [products, setProducts] = useState([])
    const [activeTab, setActiveTab] = useState('1')
    const toggle = tab => {
        if(activeTab !== tab){
            setActiveTab(tab)
        }
    }
    useEffect(() => {
        db.collection('Inventory').where('name', '!=', null)
        .get()
        .then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
            setProducts(products =>[...products, doc.data()])
            })
        })
        setIsComplete(true)
    }, [])

    if(isComplete)
        return (
            <div>
                <Nav tabs>
                    <NavItem>
                        <NavLink
                            className={classnames({active: activeTab === '1'})}
                            onClick={() => {toggle('1')}}
                        >ADD NEW PRODUCT(S)
                        </NavLink>
                    </NavItem>
                    <NavItem>
                        <NavLink
                            className={classnames({active: activeTab === '2'})}
                            onClick={() => {toggle('2')}}
                        >UPDATE EXISTING PRODUCT(S)
                        </NavLink>
                    </NavItem>
                </Nav>
                <TabContent activeTab={activeTab}>
                    <TabPane tabId='1'>
                        <AddProductsComponent></AddProductsComponent>
                    </TabPane>
                </TabContent>
            </div>
        )
    else {
        return(
            <div></div>
        )
    }
}
