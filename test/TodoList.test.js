const { assert } = require("chai")
const TodoList = artifacts.require('TodoList')

// Contenedor de contrato donde vivan nuestras pruebas para este contrato
contract('TodoList',(accounts)=>{
    before(async () =>{
        this.todoList = await TodoList.deployed() 
    })
    it('Implementacion exitosa',async()=>{
        const address = await this.todoList.address;
        assert.notEqual(address,0x0)
        assert.notEqual(address,'')
        assert.notEqual(address,null)
        assert.notEqual(address,undefined)
    })
    it('Lista de tareas', async()=>{
        const taskCount = await this.todoList.taskCount();
        const task = await this.todoList.tasks(taskCount)
        assert.equal(task.id.toNumber(), taskCount.toNumber())
        assert.equal(task.content, 'Hacer la documentacion de la tesis')
        assert.equal(task.completed, false)
        assert.equal(taskCount.toNumber(),1)
    })
    it('Crear tareas', async ()=>{
        const result = await this.todoList.createTask('Una nueva tarea');
        const taskCount =  await this.todoList.taskCount();
        assert.equal(taskCount,2);
        const event = result.logs[0].args;
        assert.equal(event.id.toNumber(),2)
        assert.equal(event.content,'Una nueva tarea')
        assert.equal(event.completed,false)
    })
    it('alternar finalización de la tarea', async ()=>{
        const result = await this.todoList.toggleCompleted(1);
        const task =  await this.todoList.tasks(1);
        assert.equal(task.completed,true);
        const event = result.logs[0].args;
        assert.equal(event.id.toNumber(),1)
        assert.equal(event.completed,true)
    })
})