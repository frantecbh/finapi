
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

function getBalance(statment){

   const balance =  statment.reduce((acc,operation) =>{
        if(operation.type === 'credit'){
            return acc + operation.amount
        }else{
            return acc - operation.amount
        }
    }, 0)

    return balance


}


//abre conta
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

//estrato
app.get("/statement", verifyIfExistsAccountCPF, (request, response) =>{ 
    
    const { customer } = request;

    return response.json(customer.statment)

});

//deposito
app.post("/deposit", verifyIfExistsAccountCPF, (request, response) =>{

    const { description, amount } = request.body;

    const { customer } = request;

    const statementOperation = {
        description,
        amount,
        created_at: new Date(),
        type: "credit"
    }


    customer.statment.push(statementOperation)


    return response.status(201).send();


})


//saque
app.post("/withtraw", verifyIfExistsAccountCPF, (request, response) =>{

        const {amount} = request.body;
        const {customer} = request;


        const balance = getBalance(customer.statment)


        if(balance < amount){
            return response.status(400).json({error: "Saldo Insuficiente!"})
        }

        const statementOperation = {
            amount,
            created_at: new Date(),
            type: "debit"
        }

        customer.statment.push(statementOperation);

        return response.status(201).send();


})

//estrato por data
app.get("/statement/date", verifyIfExistsAccountCPF, (request, response) =>{ 
    
    const { customer } = request;
    const {date} = request.query;

    const dateFormat = new Date(date + " 00:00")

    const statement =  customer.statment.filter((statement) => statement.created_at.toDateString() === new Date(dateFormat).toDateString())

    return response.json(statement)

});


app.listen(3333)



