 type Note = {
    id : string,
    content : string | Content
}

 type Content = string | {text:string , attachment : string|null}
export  {
    Note , Content
}
