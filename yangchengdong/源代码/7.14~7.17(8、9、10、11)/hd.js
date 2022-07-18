class Lesson {
    data=[]; 
    init(){
        this.data=[{name:'js'},{name:'css'}];
    };
    get(){
        return this.data;
    };
    
}
let obj = new Lesson();
obj.init();
let title = 1;
function show(){
    console.log('nimasile');
}
export {title,show,obj};