module.exports = (roles)=>{
    return ( req, res, next)=>{
        if(!roles.includes(req.user.role)){
            return res.status(403).json({
                msg: `Akses Ditolak. Role ${req.user.role} tidak diizinkan akses ini`
            })
            }
            next();
        }
    }