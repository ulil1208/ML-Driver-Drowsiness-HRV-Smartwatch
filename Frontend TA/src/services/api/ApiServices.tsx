import {
    envService
} from '../env/env';
import {
    GenService
} from '../gen/GenServices'

export const ApiServices = {
    GetData,
    postData,
    postDataPredic,
    postDataToken,
    DelData,
    post,
    postLogin,
}

const ApiUrl = envService.envUrl();

async function postDataToken(body: any,endpoint : any) {
    const token = await GenService.getStorage('token')
    let formData = new FormData;
    for (var key in body) {
        formData.append(key, body[key])
    }
    const requestOptions = {
        method: 'POST',
        body: JSON.stringify(body),
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Origin': '',
            'Authorization': 'Bearer ' + token
        },
    };

    return fetch(ApiUrl + endpoint, requestOptions)
        .then((response) => response.json())
        .then((json) => {
            return json;
        })
        .catch((error) => {
            GenService.alertErr('Network error please try again')
            console.error(error);
        });
}
async function postData(body: any,endpoint : any) {
    const token = await GenService.getStorage('token')
    let formData = new FormData;
    for (var key in body) {
        formData.append(key, body[key])
    }
    const requestOptions = {
        method: 'POST',
        body: formData,
        headers: {
            'Accept': 'application/json',
            // 'Content-Type': 'application/json',
            // 'Origin': '',
            // 'Authorization': 'Bearer ' + token
        },
    };

    return fetch(ApiUrl + endpoint, requestOptions)
        .then((response) => response.json())
        .then((json) => {
            return json;
        })
        .catch((error) => {
            GenService.alertErr('Network error please try again')
            console.error(error);
        });
}

async function postDataPredic(body: any,endpoint : any) {
    const token = await GenService.getStorage('token')
    let formData = new FormData;
    for (var key in body) {
        formData.append(key, body[key])
    }
    const requestOptions = {
        method: 'POST',
        body: formData,
        headers: {
            'Accept': 'application/json',
            // 'Content-Type': 'application/json',
            // 'Origin': '',
            // 'Authorization': 'Bearer ' + token
        },
    };

    return fetch('http://178.248.73.11:5000' + endpoint, requestOptions)
        .then((response) => response.json())
        .then((json) => {
            return json;
        })
        .catch((error) => {
            GenService.alertErr('Network error please try again')
            console.error(error);
        });
}
function postLogin(body: any,endpoint : any) {
    let formData = new FormData;
    // for (var key in body) {
    //     formData.append(key, body[key])
    // }
    const requestOptions = {
        method: 'POST',
        body: JSON.stringify(body),
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Origin': '',
        },
    };

    return fetch(ApiUrl + endpoint, requestOptions)
        .then((response) => response.json())
        .then((json) => {
            return json;
        })
        .catch((error) => {
            GenService.alertErr('Network error please try again')
            console.error(error);
        });
}
function post(endpoint : any) {
    const requestOptions = {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Origin': '',
        },
    };

    return fetch(ApiUrl + endpoint, requestOptions)
        .then((response) => response.json())
        .then((json) => {
            return json;
        })
        .catch((error) => {
            GenService.alertErr('Network error please try again')
            console.error(error);
        });
}



async function GetData(endpoint:any) {
    const token = await GenService.getStorage('token')
    
    const requestOptions = {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Origin': '',
            'Authorization': 'Bearer '+ token
        },
    };
    return fetch(ApiUrl + endpoint, requestOptions)
        .then((response) => response.json())
        .then((json) => {
            return json;
        })
        .catch((error) => {
            GenService.alertErr('Network error please try again')
            console.error(error);
        });
}
function DelData(endpoint:any) {
    const requestOptions = {
        method: 'DELETE',
    };
    return fetch(ApiUrl + endpoint, requestOptions)
        .then((response) => response.json())
        .then((json) => {
            return json;
        })
        .catch((error) => {
            GenService.alertErr('Network error please try again')
            console.error(error);
        });
}

function submitBukti(body: any,id:any) {
    let formData = new FormData;
    // for (var key in body) {
    //     formData.append(key, body[key])
    // }

    formData.append('image', {
        name: body.image.fileName,
        type: body.image.type,
        uri: body.image.uri,
    })
    const requestOptions = {
        method: 'POST',
        body: formData
    };

    return fetch(ApiUrl + '/upload-bukti/'+id, requestOptions)
        .then((response) => response.json())
        .then((json) => {
            return json;
        })
        .catch((error) => {
            GenService.alertErr('Network error please try again')
            console.error(error);
        });
}



