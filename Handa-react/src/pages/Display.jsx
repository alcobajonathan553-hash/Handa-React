import { useState, useEffect } from 'react';


export default function Display() {
    const [products, setProducts] = useState([]);
    const [name, setName] = useState('');
    const [price, setPrice] = useState('');

    const api_url = 'http://localhost:8080/api/product'
    useEffect(() => {
        fetch(api_url) //1. get raw json data from the server
            .then((response)=> response.json())  //2. convert it to a readable format for js
            .then((data) => {
                setProducts(data);  //3. put the data in a variable
            })
            .catch((err)=>err)
    }, []);   //to ensure that it will run at once only

    //post method
    async function formSubmit(event) {
        event.preventDefault() //prevent refresh
        console.log(name);
        try {
            await fetch(api_url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: name,
                    price: price
                })
            })
        } catch (err) {
            console.log(err);
        }
        
    }

    return (
        <div className="text-center d-flex justify-content-center flex-column" >
            <h1>Student</h1>

            <form onSubmit={formSubmit}>
                <label htmlFor="name">Name</label>
                <input type="text" id='name' placeholder='Name' onChange={(event)=> setName(event.target.value)} />

                <label htmlFor="price">Price</label>
                <input type="number" id='price' onChange={(event)=> setPrice(event.target.value)} />

                <input type="submit" value="Submit" />
            </form>



            <table style={{ border: '1px solid black' }}>
                <tr style={{ border: '1px solid black' }}>
                    <td>Name</td>
                    <td>Price</td>
                </tr>
                {
                    products.map((product) => (
                        <tr>
                            <td>{product.name}</td>
                            <td>{product.price}</td>
                        </tr>
                    ))
                }
            </table>
        </div>
    );
}