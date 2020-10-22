App = {
  loading:false,
    contracts:{},
  load: async () => {
    await App.loadWeb3(); // Ejecuta la conexion con metamask
    await App.loadAccount();  // Obtiene la cuenta de la  wallet de metamask
    await App.loadContract();  // Obtiene una instancia del contrato eb la red de blockchain donde se subio (Ganache)
    await App.render(); // Muestra la direccion actual que sera usada
  },
  loadWeb3: async () => {
    if (typeof web3 !== 'undefined') {
      App.web3Provider = web3.currentProvider
      web3 = new Web3(web3.currentProvider)
    } else {
      window.alert("Conéctese a Metamask")
    }
    // Modern dapp browsers...
    if (window.ethereum) {
      window.web3 = new Web3(ethereum)
      try {
        // Request account access if needed
        await ethereum.enable()
        // Acccounts now exposed
        web3.eth.sendTransaction({/* ... */})
      } catch (error) {
        // User denied account access...
      }
    }
    // Legacy dapp browsers...
    else if (window.web3) {
      App.web3Provider = web3.currentProvider
      window.web3 = new Web3(web3.currentProvider)
      // Acccounts always exposed
      web3.eth.sendTransaction({/* ... */})
    }
    // Non-dapp browsers...
    else {
      console.log('Se detectó un navegador que no es Ethereum. ¡Debería considerar probar MetaMask!')
    }
  },
  loadAccount:async()=>{
      App.account = web3.eth.accounts[0];
      console.log(App.account);
  },
  loadContract: async () => {
    const todoList = await $.getJSON('TodoList.json')
    App.contracts.TodoList = TruffleContract(todoList)
    App.contracts.TodoList.setProvider(App.web3Provider)
    App.todoList = await App.contracts.TodoList.deployed()

  },
  render: async()=>{

    // Evitar el doble renderizado
    if (App.loading) {
      // Se sale directamente de la funcion
      return
    }

    // Actualiza el estado de App.loading
    App.setLoading(true);

    // Muestra la cuenta
    $('#account').html(App.account);
    await App.renderTask();
    App.setLoading(false);
  },
  renderTask:async ()=>{
    const taskCount = await App.todoList.taskCount()
    console.log(taskCount.toNumber());
    const $taskTemplate= $('.taskTemplate');
    for (let i = 1; i <= taskCount.toNumber(); i++) {
      const task= await App.todoList.tasks(i);
      const taskId = task[0].toNumber();
      const taskContent = task[1];
      const taskCompleted  =  task[2];
      
      const $newTaskTemplate = $taskTemplate.clone();
      $newTaskTemplate.find('.content').html(taskContent);
      $newTaskTemplate.find('input')
      .prop('name',taskId)
      .prop('checked',taskCompleted)
      .on('click',App.toggleCompleted)
      if (taskCompleted) {
        $('#completedTaskList').append($newTaskTemplate)
      }
      else{
        $('#taskList').append($newTaskTemplate)
      }
      $newTaskTemplate.show();
    }
    
  },
  createTask:async()=>{
    App.setLoading(true)
    const content = $('#newTask').val();
    await App.todoList.createTask(content);
    window.location.reload();
  },
  toggleCompleted:async(e)=>{
     App.setLoading(true);
     const taskId = e.target.name;
     await App.todoList.toggleCompleted(taskId);
     window.location.reload();
   },
  setLoading:(boolean) => {
    App.loading=boolean
    const loader= $('#loader')
    const content = $('#content')
    if (boolean) {
      loader.show();
      content.hide();
    } else {
      loader.hide();
      content.show();
    }
  }
};
$(() => {
  $(window).load(() => {
    App.load();
  });
});
