  
document.getElementById('get-json').addEventListener('click', () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const tab = tabs[0];            

        function getData(){

            let jsonObject = {
                student: '',
                course: '',
                lessons: []
              };

            jsonObject.student = document.querySelector('span#header_display_name').textContent;
            
            let pathnamePieces = window.location.pathname.split('/');
            jsonObject.course = pathnamePieces[pathnamePieces.length - 1];

            let lessonGroups = document.querySelectorAll('div.lesson-group');
            
            lessonGroups.forEach(lessonGroup => {

                if (lessonGroup != undefined){

                    let lessonActivities = lessonGroup.childNodes[1].getElementsByTagName('tbody')[0].childNodes;                                        

                    lessonActivities.forEach(act => {

                        let lesson = {
                            type: lessonGroup.childNodes[0].innerText,
                            name: '',
                            activities: []
                        };

                        let actitivtyBubbles = act.cells[1].querySelectorAll('div.progress-bubble.enabled');                        
                        
                        actitivtyBubbles.forEach(bubble => {
                            let status = getActivityLevelStatus(bubble);
                            if(status != ''){
                                var activity = {                                    
                                    number: bubble.innerText,
                                    status: status
                                }        
                                lesson.name = act.cells[0].innerText;
                                lesson.activities.push(activity);
                            }
                        });                              
                        jsonObject.lessons.push(lesson);
                    });                    
                }                                
            });
            

            function getActivityLevelStatus(bubble) {

                let borderColor = bubble.style.borderColor;
                let backgroundColor = bubble.style.backgroundColor;
                let width = bubble.style.width;
                let status = '';
            
                if (borderColor === 'rgb(198, 202, 205)' && backgroundColor === 'rgb(254, 254, 254)' && width === '34px') {
                    status =  'NotStarted';
                } else if (borderColor === 'rgb(14, 190, 14)' && backgroundColor === 'rgb(254, 254, 254)' && width === '34px') {
                    status =  'InProgress';
                } else if (borderColor === 'rgb(14, 190, 14)' && backgroundColor === 'rgb(159, 212, 159)' && width === '34px') {
                    status =  'CompletedTooManyBlocks';
                } else if (borderColor === 'rgb(14, 190, 14)' && backgroundColor === 'rgb(14, 190, 14)' && width === '34px') {
                    status =  'CompletedPerfect';
                }

                return status;
            };            
              
            const blob = new Blob([JSON.stringify(jsonObject)], { type: 'text/plain' });

            const fileURL = URL.createObjectURL(blob);
            
            const downloadLink = document.createElement('a');
            downloadLink.href = fileURL;
            downloadLink.download = jsonObject.student + '_' + jsonObject.course + '.json';
            downloadLink.textContent = 'Download json file';
            
            document.body.appendChild(downloadLink);
            
            downloadLink.click();
            
            URL.revokeObjectURL(fileURL);
        };

        chrome.scripting.executeScript({
            target: { tabId: tab.id },            
            func: getData
        }).then(() => console.log('Injected a function!'));        
    });
});






