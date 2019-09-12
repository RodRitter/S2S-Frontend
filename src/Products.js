import React from 'react';
import Card from "react-bootstrap/Card";
import CardColumns from "react-bootstrap/CardColumns";
import Table from "react-bootstrap/Table";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";

export class Products extends React.Component {
    constructor(props) {
        super(props);
        this.state = { 
          modalOpen: false,
          validAddProduct: true,
          isLoadingProducts: true,
          isLoadingAdding: false,
          products: [],
          newProductSku: '',
          newProductAtts: [{
                key: '',
                value: ''
          }]
       };

       this.openModal = this.openModal.bind(this);
       this.closeModal = this.closeModal.bind(this);
       this.updateProducts = this.updateProducts.bind(this);
       this.createProduct = this.createProduct.bind(this);
    }

    componentDidMount() {
        this.updateProducts();
    }
  
    render() {
        return (
            <div className="product-page">
                <link
                    rel="stylesheet"
                    href="https://maxcdn.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css"
                    integrity="sha384-ggOyR0iXCbMQv3Xipma34MD+dH/1fQ784/j6cY/iJTQUOhcWr7x9JvoRxT2MZw1T"
                    crossOrigin="anonymous"
                />

                <Button variant="primary" size="md" className="add-button" onClick={this.openModal}>Add Product</Button>

                {this.renderLoadingProducts()}

                <CardColumns>
                    {this.createCards(this.state.products)}
                </CardColumns>

                <Modal show={this.state.modalOpen} onHide={this.closeModal}>
                    <Modal.Header closeButton>
                    <Modal.Title>Add Product</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>


                    <Form>
                        <Form.Group controlId="productSku">
                            <Form.Label>SKU</Form.Label>
                            <Form.Control 
                                type="text" 
                                placeholder="Product SKU"
                                value={this.state.newProductSku}
                                onChange={(event) => {this.setState({ newProductSku: event.target.value })}}
                            />
                        </Form.Group>

                        <Form.Label>Attributes</Form.Label>

                        {this.state.newProductAtts.map((att,index) => {

                            return <Row className="new-attr-row" key={index}>
                                <Col>
                                    <Form.Control 
                                        placeholder="Key" 
                                        type="text" 
                                        value={this.state.newProductAtts[index].key}
                                        onChange={(event) => {
                                            let arr = [...this.state.newProductAtts];
                                            arr[index].key = event.target.value;
                                            this.setState({ newProductAtts: arr })
                                        }} 
                                    />
                                </Col>
                                <Col>
                                    <Form.Control 
                                        placeholder="Value" 
                                        type="text" 
                                        value={this.state.newProductAtts[index].value}
                                        onChange={(event) => {
                                            let arr = [...this.state.newProductAtts];
                                            arr[index].value = event.target.value;
                                            this.setState({ newProductAtts: arr })
                                        }} 
                                    />
                                </Col>
                                <Col>
                                    <Button variant="link" onClick={() => {
                                        let arr = [...this.state.newProductAtts];
                                        arr.splice(index,1);
                                        this.setState({newProductAtts: arr});
                                    }}>Remove</Button>
                                </Col>
                            </Row>
                        })}
                        

                        <Button 
                            className="add-attr-btn mt-2" 
                            variant="primary" 
                            size="sm"
                            onClick={() => {
                                let arr = [...this.state.newProductAtts];
                                arr.push({key: '', value: ''});
                                this.setState({newProductAtts: arr});
                            }}>
                            New Attribute
                        </Button>
                    </Form>


                    {this.renderLoadingAdding()}
                    </Modal.Body>
                    <Modal.Footer>
                    <Button variant="success" onClick={this.createProduct} disabled={!this.state.validAddProduct}>
                        Add
                    </Button>
                    <Button variant="danger" onClick={this.closeModal}>
                        Close
                    </Button>
                    </Modal.Footer>
                </Modal>

            </div>
        );
    }

    closeModal() {
        this.setState({modalOpen: false})
    }

    openModal() {
        this.setState({modalOpen: true});
    }

    updateProducts() {
        this.setState({isLoadingProducts: true});
        fetch('http://localhost:5000/products', {
            method: 'GET',
            headers: {'Content-Type': 'application/json'}
        })
        .then(response => response.json())
        .then(data => {
            this.setState({isLoadingProducts: false})
            if(data.results !== undefined) {
                this.setState({
                    products: this.parseProducts(data.results)
                });
                
            }
        });
    }

    createProduct() {
        if (this.state.newProductSku.trim() != '') {

            this.setState({isLoadingAdding: true});

            fetch('http://localhost:5000/products', {
                method: 'POST',
                mode: 'cors',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    'sku': this.state.newProductSku.trim(),
                    'attributes': this.getCleanAttributes()
                })
            })
            .then((response) => response.json())
            .then(data => {
                this.setState({
                    newProductSku: '',
                    newProductAtts: [{
                        key: '',
                        value: ''
                    }]
                });
                this.updateProducts();
                this.closeModal();
            })
            .finally(() => {
                this.setState({isLoadingAdding: false});
            })
        }
        
    }

    getCleanAttributes() {
        let atts = [...this.state.newProductAtts];
        atts.map((att, index) => {
            if(att.key.trim() == '') {
                atts.splice(index,1);
            }
        });
        return atts;
    }

    parseProducts(products) {
        let parsed = [];
        products.map((product) => {
            let attributes = [];
            Object.keys(product.attributes).map((key) => {
                attributes.push({key: key, value:product.attributes[key]});
            });
            parsed.push({sku: product.sku, attributes:attributes})
        });
        return parsed;
    }

    createCards(products) {
        let cards = [];

        products.map((product, index) => {
            // Create attribute list
            let attributes = [];
            product.attributes.map((att, index) => {
                attributes.push(
                    <tr key={index}>
                        <td>{att.key}</td>
                        <td>{att.value}</td>
                    </tr>
                );
            });

            // Create Card
            cards.push(<Card key={index}>
                <Card.Img variant="top" src="https://picsum.photos/id/526/400/200?blur=5" />
                    <Card.Body>
                        <Card.Title>{product.sku}</Card.Title>
                        <Table bordered size="sm">
                            <tbody>
                            {attributes}
                            </tbody>
                        </Table>
    
                        {/* <Card.Link href="#">Update</Card.Link>
                        <Card.Link href="#">Delete</Card.Link> */}
    
                    </Card.Body>
                </Card>);
        });
        

        return cards;
    }

    renderLoadingProducts() {
        return(<div className={this.state.isLoadingProducts ? 'lds-ellipsis' : 'hidden'}><div></div><div></div><div></div><div></div></div>)
    }

    renderLoadingAdding() {
        return(<div className={this.state.isLoadingAdding ? 'lds-ellipsis' : 'hidden'}><div></div><div></div><div></div><div></div></div>)
    }

}

export default Products;