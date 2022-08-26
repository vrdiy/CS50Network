document.addEventListener('DOMContentLoaded', function() {
 
    console.log("loaded...");
    document.querySelector('#compose-post').onsubmit = try_post;
    //document.querySelector('#newpost').addEventListener('click', compose_post);
    
    let profileid = parseInt(document.querySelector('#profileid').innerHTML);
    profileid < 0 ? profileid = 0: '';
    document.querySelector('#showposts').addEventListener('click',()=> show_posts(profileid));
    try{
        document.querySelector('#following').addEventListener('click',()=> show_posts(undefined,undefined,true));
        }
        catch(typeerror){
    
        }
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

function page_bootstrap(id,currentpage){
    
    paginationbootstrap = document.createElement('nav');
    paginationbootstrap.setAttribute('aria-label', '...');
    paginationunorderedlist = document.createElement('ul');
    paginationunorderedlist.setAttribute('class','pagination');

    if(currentpage.has_previous){
        paginationunorderedlist.innerHTML += `<li class="page-item">
        <a class="page-link" href="javascript:show_posts(${id},${Number(currentpage.page_num)-1})">Previous</a>
      </li>`
    }else{
        paginationunorderedlist.innerHTML += `<li class="page-item disabled">
        <a class="page-link" href="" tabindex="-1" aria-disabled="true">Previous</a>
      </li>`
    }
    
    
    for(let i = 1; i <= Number(currentpage.num_pages); i++){
        //if(i === Number(currentpage.page_num)){
        paginationunorderedlist.innerHTML += `<li class="page-item ${(i === Number(currentpage.page_num)? 'active' : '')}">
        <a class="page-link" href="javascript:show_posts(${id},${i})">${i}</a>
        </li>`;
    }

    if(currentpage.has_next){
        paginationunorderedlist.innerHTML += `<li class="page-item">
        <a class="page-link" href="javascript:show_posts(${id},${Number(currentpage.page_num)+1})">Next</a>
      </li>`;
    }else{
        paginationunorderedlist.innerHTML += `<li class="page-item disabled">
        <a class="page-link" href="" tabindex="-1" aria-disabled="true">Next</a>
      </li>`;
    }

    paginationbootstrap.append(paginationunorderedlist);
    return paginationbootstrap;
   

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

function edit_post(id){
    const posttoedit = document.querySelector(`#editpost-${id}`).parentElement;
    postcontent = posttoedit.querySelector(".postinnercontent");
    //const postcontentvalue = JSON.parse(JSON.stringify(postcontent.innerHTML));
    const postcontentvalue = postcontent.innerHTML;
    postcontent.style.display = 'none';

    try{
        posttoedit.querySelector('div').remove()
        //posttoedit.querySelector('textarea').remove();
        //posttoedit.querySelector('button').remove();

    }catch(error){

    }
    const editdiv = document.createElement('div');
    const savebutton = document.createElement('button');
    savebutton.setAttribute("id",`save-form-button-${id}`);
    savebutton.addEventListener('click', ()=> try_edit(id,document.querySelector(`#editedcontent-${id}`).value));
    savebutton.innerHTML = 'Save';
    const editarea = document.createElement('textarea');
    editarea.setAttribute("id",`editedcontent-${id}`);
    editarea.style.width = '80vw';
    editarea.style.color = 'blue';
    editarea.value = postcontentvalue;
    //postcontent.innerHTML = ``;
    //editarea.setAttribute("style","color: red; margin-bottom: 60px; margin-left: 10px;");
    editdiv.append(editarea);
    editdiv.append(savebutton);
    posttoedit.append(editdiv);
    //posttoedit.append(editarea);
    //posttoedit.append(savebutton);

    
}

function try_edit(postid, textcontent){
    

    fetch('/editpost',{
        method: 'POST',
        body: JSON.stringify({
            textcontent: textcontent,
            postid: postid
        })

  })
  .then(response => {
    if(response.status === 401){
        window.location.replace("/login");
    }
    if(response.status === 201){
        
    const posttoedit = document.querySelector(`#editpost-${postid}`).parentElement;
    postcontent = posttoedit.querySelector(".postinnercontent");
    postcontent.innerHTML = textcontent;
    postcontent.style.display = 'block';
    document.querySelector(`#editedcontent-${postid}`).remove();
    document.querySelector(`#save-form-button-${postid}`).remove();
    }
    console.log(response.status);
    return response;
})
  .then(response => response.json())
  .then(result => {
    console.log(result);
    console.log("bottom of try_edit");
  })

  return false;
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


function show_posts(userid=0,pagenum=1,following = false){

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

    fetch(`/getposts/${userid}?page_number=${pagenum}&following=${following}`)
    .then(response => {
        if(response.status != 201){return false;}
        else{
            return response.json();
        }
        })
    .then(posts => {
        if(posts){
        console.log("count:");
        //There is meta data in a dict at the end of the response
        //console.log(posts[posts.length-1].count);
        //console.log(`From showposts: ${posts[posts.length-1].page_num}`)
        console.log(posts)
        postsdiv.append(page_bootstrap(userid,posts[posts.length-1]));
        
        posts.pop();
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

            const contentdiv = document.createElement('div');
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
            


            //editbutton
            //const spanthebutton = document.createElement('span');
            const editbutton = document.createElement('input');
            editbutton.setAttribute("id",`editpost-${element.id}`);
            editbutton.addEventListener('click', ()=> edit_post(element.id));
            editbutton.type = "image";
            editbutton.src = editbuttonimg;
            //spanthebutton.append(editbutton);


            singlePost.append(meta);
            singlePost.append(textcontent);
            element.ownpost ? singlePost.append(editbutton) : null;
            singlePost.append(likebutton);
            singlePost.append(namelink);

            postsdiv.append(singlePost);
        })
        //postsdiv.append(page_bootstrap(userid,posts[posts.length-1]))
    }
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

