export default function getParameters(e) {
    return e && "string" == typeof e ? JSON.parse('{"' + decodeURI(e.split("?")[1]).replace(/"/g, '\\"').replace(/&/g, '","').replace(/=/g, '":"') +'"}'):"";
}