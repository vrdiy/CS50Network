document.addEventListener('DOMContentLoaded', function() {
 

document.querySelector('#compose-post').onsubmit = try_post;
    //document.querySelector('#newpost').addEventListener('click', compose_post);
    document.querySelector('#showposts').addEventListener('click', show_posts);

    show_posts();
});

//my helper functions 
//-----------------------------------------
function boldThisHTML(str){
    const bolded = document.createElement('b')
    bolded.innerHTML = str;
    return bolded;
  }
  
  function line_break(){
      return document.createElement('br');
  }

  function name_links(id,username){
    const namelink = document.createElement('strong');
    namelink.innerHTML = `${username}`;
    namelink.setAttribute("id",`nameButton-${id}`);
    return namelink;
    
}
//-----------------------------------------

function like_post(id){
    fetch(`/likepost/${id}`,{
        method: 'POST',
        body: ""
        })

  
    .then(response => response.json())
    .then(result => {
        if(result.likestatus === '1'){
        document.querySelector(`#post-${id}`).src = likebuttonimg;
        document.querySelector(`#post-${id}-likes`).innerHTML = parseInt(document.querySelector(`#post-${id}-likes`).innerHTML)+1;
        
        }
        else if(result.likestatus === '0'){
            document.querySelector(`#post-${id}`).src = haventlikedbuttonimg;
            document.querySelector(`#post-${id}-likes`).innerHTML = parseInt(document.querySelector(`#post-${id}-likes`).innerHTML)-1;
        }
        console.log(result.message)
    })
    
}
function load_profile(userid){
    fetch(`/profile/${userid}`)
    .then(response => response.json())
    .then(result => {
        
        const postsdiv = document.querySelector('#posts');
        const info = document.createElement('p');
        info.className = "banner";
        info.innerHTML =  `${result[result.length -1]["username"]}'s Profile \n Followers: ${result[result.length -1]["followers"]} \n Following: ${result[result.length -1]["following"]}`;
        document.querySelector('#posts').innerHTML = '';
        postsdiv.append(info);
        
        //console.log(result[result.length -1]["followers"]);
        

        //Show posts
        for(let i = 0; i< result.length-1;i++){
            element = result[i];
            if(element.id){
            counter = 0;
            for(let like in element.likes){
                counter++;
            }
            const singlePost = document.createElement('div');
            singlePost.className = "post";

            const textcontent = document.createElement('p');
            textcontent.innerHTML = `${element.textcontent}`;
            textcontent.className = "postinnercontent";
            
            //not valuable for this view but consistent with the other pages
            const namelink = document.createElement('strong');
            namelink.innerHTML = `${element.user}`;
            namelink.setAttribute("id",`nameButton-${element.id}`);
            namelink.addEventListener('click', () => load_profile(element.userid));

            const meta = document.createElement('p');
            meta.append("Posted by ");
            meta.innerHTML += `\n<span id="post-${element.id}-likes">${counter}</span> likes\n${element.timestamp}\n`;
            meta.style.borderBottom = '1px solid grey';
            
            const likebutton = document.createElement('input');
            likebutton.setAttribute("id",`post-${element.id}`);
            
            //need to scope this event listener because for some reason when triggered, element.id is like a global variable when it (in my mind) should/would be a copy
            //it also works to declare a local variable and then pass that in aswell:
            //const localvar = element.id
            //likebutton.addEventListener('click',() => like_post(localvar));
            (function(elementid){
            likebutton.addEventListener('click',() => like_post(elementid))})(element.id);
            likebutton.type = "image";
            
            if(element.userhasliked){
                likebutton.src = likebuttonimg;
            }
            else{
                likebutton.src = haventlikedbuttonimg;
            }

            singlePost.append(meta);
            singlePost.append(textcontent);
            singlePost.append(likebutton);
            singlePost.append(namelink)

            
            postsdiv.append(singlePost);
            //tmplikebutton = postsdiv.querySelector(`#post-${element.id}`);
            //const pid = element.id;
            //tmplikebutton.addEventListener('click',() => like_post(pid));

        }
        }
        
})
console.log("tried");
}


function show_posts(){

    document.querySelector('#compose-post').style.display = 'none';
    document.querySelector('#posts').style.display = 'block';
    document.querySelector('#posts').innerHTML = '';
    const postsdiv = document.querySelector('#posts');
    const newpostbutton = document.createElement('button');
    newpostbutton.addEventListener('click', compose_post);
    newpostbutton.setAttribute("id","newpost");
    newpostbutton.innerHTML = "New Post";
    postsdiv.append(newpostbutton);

    document.querySelector('#text-content').value = '';

    fetch('/getposts')
    .then(response => response.json())
    .then(posts => {
        console.log(posts);
        posts.forEach(element =>{
            console.log("list of elements");
            console.log(element);
            console.log("end list");
            counter = 0;
            for(let like in element.likes){
                counter++;
            }
            const singlePost = document.createElement('div');
            singlePost.className = "post";

            const textcontent = document.createElement('p');
            textcontent.innerHTML = `${element.textcontent}`;
            textcontent.className = "postinnercontent";

            const namelink = document.createElement('strong');
            namelink.innerHTML = `${element.user}`;
            namelink.setAttribute("id",`nameButton-${element.id}`);
            namelink.addEventListener('click', () => load_profile(element.userid));

            const meta = document.createElement('p');
            meta.append("Posted by ");
            //meta.append(namelink);
            meta.innerHTML += `\n<span id="post-${element.id}-likes">${counter}</span> likes\n${element.timestamp}\n`;

            //meta.innerHTML = `\n<span id="post-${element.id}-likes">${counter}</span> likes\n${element.timestamp}\n`;
            meta.style.borderBottom = '1px solid grey';
            //meta.
            //likebutton
            const likebutton = document.createElement('input');
            likebutton.setAttribute("id",`post-${element.id}`);
            likebutton.addEventListener('click',() => like_post(element.id));
            likebutton.type = "image";
            
            if(element.userhasliked){
                likebutton.src = likebuttonimg;
            }
            else{
                likebutton.src = haventlikedbuttonimg;
            }

            singlePost.append(meta);
            singlePost.append(textcontent);
            singlePost.append(likebutton);
            singlePost.append(namelink)

            postsdiv.append(singlePost);
        })
    })

}

function compose_post(){

    document.querySelector('#compose-post').style.display = 'block';
    document.querySelector('#posts').style.display = 'none';


}


function try_post(){
    const posttext = document.querySelector('#text-content').value;

    fetch('/newpost',{
        method: 'POST',
        body: JSON.stringify({
            textcontent: posttext
        })

  })
  .then(response => response.json())
  .then(result => {
    console.log(result);
    show_posts();
  })

  return false;

}

