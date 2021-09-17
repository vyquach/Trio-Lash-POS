import React, { useEffect, useState } from 'react'
import { db } from '../firebase'
import { Table } from 'reactstrap'

export default function ViewInventoryComponent(props) {
        return (
            <Table>
                <thead>
                    <tr>
                        <th>Code</th>
                        <th>Name</th>
                        <th>Description</th>
                        <th>Price</th>
                        <th>Quantity</th>
                    </tr>
                </thead>
                <tbody>
                    {props.products.map(data => {
                        return (
                            <tr key={data.code}>
                                <td scope='row' width='10%'>{data.code}</td>
                                <td width='15%'>{data.name}</td>
                                <td width='55%'>{data.description}</td>
                                <td width='10%'>{data.price}</td>
                                <td width='10%'>{data.quantity}</td>
                            </tr>
                        )
                    })}
                </tbody>
            </Table>
        )
}
