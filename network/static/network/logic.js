document.addEventListener('DOMContentLoaded', function() {
 
    console.log("loaded...");
    document.querySelector('#compose-post').onsubmit = try_post;
    //document.querySelector('#newpost').addEventListener('click', compose_post);
    
    let profileid = parseInt(document.querySelector('#profileid').innerHTML);
    profileid < 0 ? profileid = 0: '';
    document.querySelector('#showposts').addEventListener('click',()=> show_posts(profileid));
    try{
    document.querySelector('#followbutton').addEventListener('click',()=> follow_user(profileid));
    }
    catch(typeerror){

    }
    console.log("going to show posts");
    show_posts(profileid);
    
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

    .then(response => {
        if(response.status === 401){
            window.location.replace("/login");
        }
        console.log(response.status);
        return response;
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

function follow_user(id){
    fetch(`/followuser/${id}`,{
        method: 'POST',
        body: ""
        })

        .then(response => {
            if(response.status === 401){
                window.location.replace("/login");
            }
            console.log(response.status);
            return response;
        })
    .then(response => response.json())
    .then(result => {
        if(result.followstatus === '1'){
        document.querySelector(`#followbutton`).innerHTML = "Unfollow";
        document.querySelector(`#followercount`).innerHTML = parseInt(document.querySelector(`#followercount`).innerHTML)+1;
        
        }
        else if(result.followstatus === '0'){
            document.querySelector(`#followbutton`).innerHTML = "Follow";
            document.querySelector(`#followercount`).innerHTML = parseInt(document.querySelector(`#followercount`).innerHTML)-1;
        }
        console.log(result.message)
    })
    
}


function show_posts(userid=0){

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

    fetch(`/getposts/${userid}`)
    .then(response => response.json())
    .then(posts => {
        //console.log(posts);
        posts.forEach(element =>{
            //console.log("list of elements");
            //console.log(element);
            //console.log("end list");
            counter = 0;
            for(let like in element.likes){
                counter++;
            }

            const singlePost = document.createElement('div');
            singlePost.className = "post";

            const textcontent = document.createElement('p');
            textcontent.innerHTML = `${element.textcontent}`;
            textcontent.className = "postinnercontent";

            const namelink = document.createElement('a');
            namelink.innerHTML = `${element.user}`;
            namelink.setAttribute("id",`nameButton-${element.user}`);
            namelink.setAttribute("href",`/profile/${element.userid}`);
           // namelink.addEventListener('click', () => load_profile(element.userid));

            const meta = document.createElement('p');
            meta.append("Posted by ");
            meta.innerHTML += `\n<span id="post-${element.id}-likes">${counter}</span> likes\n${element.timestamp}\n`;

            
            meta.style.borderBottom = '1px solid grey';
            
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
  .then(response => {
    if(response.status === 401){
        window.location.replace("/login");
    }
    console.log(response.status);
    return response;
})
  .then(response => response.json())
  .then(result => {
    console.log(result);
    console.log("bottom of try_post");
    show_posts();
  })

  return false;

}

