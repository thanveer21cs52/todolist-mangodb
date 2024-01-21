const express=require("express")
const bodyparser=require("body-parser")
const mongoose=require("mongoose")
const _=require("lodash")
const app=express();
app.use(bodyparser.urlencoded({extended:true}))
app.use(express.static("public"))
app.set('view engine','ejs');
const day=new Date();
var today=day.toLocaleDateString("en-US",option)
mongoose.connect("mongodb://127.0.0.1:27017/dotolistDB")
const itemschema=mongoose.Schema({
    name:String
})
const listschema=mongoose.Schema({
    name:String,
    item:[itemschema]
})
const Item=mongoose.model("item",itemschema);
const Lists=mongoose.model("list",listschema);
var defultlist=[]
const item1=new Item({
    name:"wakeup early"
})
const item2=new Item({
    name:"go to gym"
})
const item3=new Item({
    name:"prepare a food"
})
var defultlist=[item1,item2,item3]


var option={
    day:"numeric",
    weekday:"long",
    month:"long"
}
var today=day.toLocaleDateString("en-US",option)
app.get("/",(req,res)=>{
    Item.find({}).then((founditem)=>{
        if(founditem.length==0){
                Item.insertMany(defultlist).then(()=>{
                    console.log('successfully stored')
                }).catch((err)=>{
                    console.log(err)
                })
               res.redirect("/")
        }
        else{
            res.render("list",{presentday:"Today",newitems:founditem});
        }
        
        console.log(founditem.length)
    }).catch((err)=>{
        console.log(err)
    })
    
    
    
})
app.get("/:getname",(req,res)=>{
    const listname=_.lowerCase(req.params.getname);
    Lists.findOne({name:listname}).then((foundresult)=>{
        if(!foundresult){
            const posts=new Lists({
                name:listname,
                item:defultlist
            })
            posts.save()
            console.log("stored")
            res.redirect("/"+listname)

        }
        else{
            res.render("list",{presentday:listname,newitems:foundresult.item});
        }
    })
    
})
app.post("/",(req,res)=>{
    const enteritem=req.body.itm
    const checkenter=req.body.list
    const getitem = new Item({
        name:enteritem
    })
    if(checkenter=="Today"){
        getitem.save()
        res.redirect("/")
    }
    else{
        Lists.findOne({name:checkenter}).then((finditem)=>{
            finditem.item.push(getitem)
            finditem.save()
            res.redirect("/"+checkenter)
        })
    }
    
    
    
    
})
app.post("/delete",(req,res)=>{
    const checkeditem=req.body.checkbox
    const listitem=req.body.listitem
    if(listitem=="Today"){
        Item.deleteOne({_id:checkeditem}).then(()=>{
            console.log('successfully deleted')
        }).catch((err)=>{
            console.log(err)
        })
        res.redirect("/")
    }
    else{
        Lists.findOneAndUpdate({name:listitem},{$pull:{item:{_id:checkeditem}}}).then((err,founditem)=>{
            res.redirect("/"+listitem)
        })
    }
    
})


app.listen("3000",()=>{
    console.log("the port 3000 started perpectly")
})