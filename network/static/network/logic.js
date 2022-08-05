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
//-----------------------------------------
function like_post(id){
    fetch(`/likepost/${id}`,{
        method: 'POST',
        body: ""
        })

  
    .then(response => response.json())
    .then(result => {
        console.log(result);
    })
    
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

            const meta = document.createElement('p');
            meta.innerHTML = `Posted by ${element.user},\n${counter} likes\n${element.timestamp}\n`;
            meta.style.borderBottom = '1px solid grey';

            //likebutton
            const likebutton = document.createElement('input');
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

