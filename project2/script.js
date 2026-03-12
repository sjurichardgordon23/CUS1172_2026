
let tasks = [];


let taskForm = document.getElementById("taskForm");
let taskList = document.getElementById("task_list");


function createTask(name, priority) {
    let task = {
        "task_id": tasks.length + 1,
        "task_name": name,
        "priority": priority,
        "task_status": "pending"
    };
    return task;
}


taskForm.onsubmit = function(event) {
    event.preventDefault();
    
    let taskName = document.getElementById("taskName").value;
    let taskPriority = document.getElementById("taskPriority").value;
    
   
    let newTask = createTask(taskName, taskPriority);
    tasks.push(newTask);
    
  
    addTaskToPage(newTask);
    
  
    taskForm.reset();
};


function addTaskToPage(task) {
    let li = document.createElement("li");
    li.className = "task-item";
    li.setAttribute("data-task-id", task.task_id);
    
    let taskText = document.createElement("span");
    taskText.textContent = task.task_name + " - " + task.priority;
    
    let buttonDiv = document.createElement("div");
    
    let doneBtn = document.createElement("button");
    doneBtn.className = "done btn btn-success btn-sm me-2";
    doneBtn.textContent = "Done";
    
    let removeBtn = document.createElement("button");
    removeBtn.className = "remove btn btn-danger btn-sm";
    removeBtn.textContent = "Remove";
    
    buttonDiv.appendChild(doneBtn);
    buttonDiv.appendChild(removeBtn);
    
    li.appendChild(taskText);
    li.appendChild(buttonDiv);
    
    taskList.appendChild(li);
}


taskList.addEventListener("click", function(event) {
    let element = event.target;
    let taskItem = element.closest(".task-item");
    
    if (element.className.includes("remove")) {
        let taskId = taskItem.getAttribute("data-task-id");
        tasks = tasks.filter(t => t.task_id != taskId);
        taskItem.remove();
    }
    
    if (element.className.includes("done")) {
        let taskId = taskItem.getAttribute("data-task-id");
        let task = tasks.find(t => t.task_id == taskId);
        if (task) {
            task.task_status = "completed";
            taskItem.style.textDecoration = "line-through";
            taskItem.style.color = "gray";
        }
    }
});
