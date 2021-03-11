
const { request } = require("express");
const express = require("express");
const { v4 : uuidv4 }  = require ("uuid")

const app = express();

app.use(express.json())

/**
 * cpf
 * nae
 * id
 * statement
 */

const customers = []

//Middleware

function verifyIfExistsAccountCPF(request, response, next){

     //const { cpf } = request.params;
     const { cpf } = request.headers;

     const customer = customers.find((customer) => customer.cpf === cpf)
 
     if(!customer){
         return response.status(400).json('Nao existe nenhuma conta')
     }
 
     request.customer = customer;

     return next()

}



app.post("/account", (request, response) =>{

    const {cpf, name} = request.body;

    const custmerAlredyExists = customers.some((customer) => customer.cpf === cpf)

    console.log(custmerAlredyExists)

    if(custmerAlredyExists){
        return response.status(400).json({error: "Customer already Existes!"})
    }

    customers.push({
        cpf,
        name,
        id: uuidv4(),
        statment:[]

    })

    return response.status(201).json(customers)

})

//app.use(verifyIfExistsAccountCPF)

app.get("/statement", verifyIfExistsAccountCPF, (request, response) =>{ 
    
    const { customer } = request;

    return response.json(customer.statment)

})


app.listen(3333)

