// const crypto= require('crypto')

// const token= crypto.randomBytes(32).toString('hex')
// console.log(token)

// let hash= crypto.createHash('SHA256').update(token).digest('hex')
// console.log(hash)








// userSchema.methods.createPasswordResetToken = async function () {
//   const resetToken = crypto.randomBytes(32).toString('hex');

//   this.passwordResetToken = crypto
//     .createHash('SHA256')
//     .update(resetToken)
//     .digest('hex')

//   this.passwordResetExpiresAt = Date.now() + 30 * 60 * 1000; // 10 minutes

//   return resetToken;
// }
