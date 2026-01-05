export const envService = {
    envUrl,
}

function envUrl() {
    // ubah value env 1 untuk (production) dan 2 untuk (Local/dev mode)
    var env = 2;
    var url = ''
    if (env == 2) {
        return url = 'https://telematics.transtrack.id/api'
    } else {
        return url = 'http://178.248.73.11:5001'
    }

}