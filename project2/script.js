let tasks = [];
let nextTaskId = 1;

let taskForm = document.getElementById("taskForm");
let taskList = document.getElementById("task_list");

function createTask(name, priority, status) {
    let task = {
        "task_id": nextTaskId,
        "task_name": name,
        "priority": priority,
        "task_status": status
    };
    nextTaskId = nextTaskId + 1;
    return task;
}

taskForm.onsubmit = function(event) {
    event.preventDefault();
    
    let taskName = document.getElementById("taskName").value;
    let taskPriority = document.getElementById("taskPriority").value;
    let taskStatus = document.querySelector("input[name='taskStatus']:checked").value;
    
    
    let newTask = createTask(taskName, taskPriority, taskStatus);
    tasks.push(newTask);
    
    
    addTaskToPage(newTask);
    
    
    taskForm.reset();
};

function addTaskToPage(task) {
    let li = document.createElement("li");
    li.className = "task-item";
    li.setAttribute("data-task-id", task.task_id);
    
    
    let taskInfo = document.createElement("div");
    taskInfo.className = "task-info";
    
    let taskText = document.createElement("span");
    taskText.textContent = task.task_name + " (Priority: " + task.priority + ", Status: " + task.task_status + ")";
    
    
    if (task.task_status === "completed") {
        taskText.style.textDecoration = "line-through";
    }
    
    taskInfo.appendChild(taskText);
    
    
    let buttonDiv = document.createElement("div");
    buttonDiv.className = "task-buttons";
    
    let completeBtn = document.createElement("button");
    completeBtn.type = "button";
    completeBtn.className = "complete btn btn-success";
    completeBtn.textContent = "Mark Complete";
    
    let removeBtn = document.createElement("button");
    removeBtn.type = "button";
    removeBtn.className = "remove btn btn-danger";
    removeBtn.textContent = "Remove";
    
    buttonDiv.appendChild(completeBtn);
    buttonDiv.appendChild(removeBtn);
    
    li.appendChild(taskInfo);
    li.appendChild(buttonDiv);
    
    taskList.appendChild(li);
}


taskList.addEventListener("click", function(event) {
    let element = event.target;
    
    
    if (element.tagName === "BUTTON") {
        let taskItem = element.closest(".task-item");
        let taskId = parseInt(taskItem.getAttribute("data-task-id"));
        
        
        if (element.classList.contains("remove")) {
            
            tasks = tasks.filter(function(t) {
                return t.task_id !== taskId;
            });
            
            taskItem.remove();
        }
        
        
        if (element.classList.contains("complete")) {
            let task = tasks.find(function(t) {
                return t.task_id === taskId;
            });
            
            if (task) {
                
                if (task.task_status === "pending") {
                    task.task_status = "completed";
                } else {
                    task.task_status = "pending";
                }
                
                /
                let taskText = taskItem.querySelector("span");
                if (task.task_status === "completed") {
                    taskText.style.textDecoration = "line-through";
                } else {
                    taskText.style.textDecoration = "none";
                }
                
                
                element.textContent = task.task_status === "completed" ? "Mark Pending" : "Mark Complete";
                
                
                taskText.textContent = task.task_name + " (Priority: " + task.priority + ", Status: " + task.task_status + ")";
            }
        }
    }
});
