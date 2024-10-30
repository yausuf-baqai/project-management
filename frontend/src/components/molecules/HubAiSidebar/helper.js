import { useToast } from "vue-toast-notification";
import taskClass from "@/utils/TaskOperations"

const $toast = useToast();

export const insertDescription = (values,project,userData,task,companyId) => {
    return new Promise((resolve,reject) => {
        try {
            let description = values.description
            if(task.description){
                description = task.description + description
            }
            let obj = {
                text: description,
                html: `<p>${description}</p>`
            }
            const projectData = {
                id: project._id,
                ProjectName: project.ProjectName
            }
        
            taskClass.updateDescription({
                companyId: companyId,
                projectData: projectData,
                sprintId: task.sprintId,
                task: task,
                userData: userData,
                text: obj
            }).then(() => {
                resolve();
                $toast.success('Description updated successfully',{position: 'top-right'});
            })
            .catch((error) => {
                console.error("Error in updating Description: ", error);
                $toast.error('Description not updated',{position: 'top-right'});
            })
        } catch (error) {
            reject();
            console.error("Error in updating Description: ", error);
        }
    })
}