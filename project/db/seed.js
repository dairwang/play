const fs = require('fs')
const path = require('path')
const envPath = path.resolve(__dirname, '../be/.env')
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, 'utf8')
  content.split('\n').forEach(line => {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)
    if (m) process.env[m[1]] = m[2]
  })
}
const sequelize = require('../be/config/db')
const User = require('../be/models/user')
const Game = require('../be/models/game')
const CompanionService = require('../be/models/companionService')

async function run() {
  await sequelize.authenticate()
  await sequelize.sync()

  const [admin] = await User.findOrCreate({ where: { username: 'admin' }, defaults: { password: '123456', nickname: '管理员', role: 'admin' } })
  const [comp] = await User.findOrCreate({ where: { username: 'comp1' }, defaults: { password: '123456', nickname: '陪玩师Alice', role: 'user', is_companion: true } })
  const [user] = await User.findOrCreate({ where: { username: 'user1' }, defaults: { password: '123456', nickname: '普通用户Bob', role: 'user' } })

  const [lol] = await Game.findOrCreate({ where: { name: '英雄联盟' }, defaults: { icon: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=200&auto=format&fit=crop', cover: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=1200&auto=format&fit=crop' } })
  const [kog] = await Game.findOrCreate({ where: { name: '王者荣耀' }, defaults: { icon: 'https://images.unsplash.com/photo-1517466787929-48cae717c81a?q=80&w=200&auto=format&fit=crop', cover: 'https://images.unsplash.com/photo-1517466787929-48cae717c81a?q=80&w=1200&auto=format&fit=crop' } })
  const [pubg] = await Game.findOrCreate({ where: { name: '和平精英' }, defaults: { icon: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=200&auto=format&fit=crop', cover: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1200&auto=format&fit=crop' } })
  const [genshin] = await Game.findOrCreate({ where: { name: '原神' }, defaults: { icon: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=200&auto=format&fit=crop', cover: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=1200&auto=format&fit=crop' } })
  await lol.update({ icon: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=200&auto=format&fit=crop', cover: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=1200&auto=format&fit=crop' })
  await kog.update({ icon: 'https://images.unsplash.com/photo-1517466787929-48cae717c81a?q=80&w=200&auto=format&fit=crop', cover: 'https://images.unsplash.com/photo-1517466787929-48cae717c81a?q=80&w=1200&auto=format&fit=crop' })
  await pubg.update({ icon: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=200&auto=format&fit=crop', cover: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1200&auto=format&fit=crop' })
  await genshin.update({ icon: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=200&auto=format&fit=crop', cover: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=1200&auto=format&fit=crop' })

  await admin.update({ avatar: 'https://images.unsplash.com/photo-1542206395-9feb3edaa68f?q=80&w=400&auto=format&fit=crop' })
  await comp.update({ avatar: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=400&auto=format&fit=crop' })
  await user.update({ avatar: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=400&auto=format&fit=crop' })

  await CompanionService.findOrCreate({ where: { user_id: comp.id, game_id: lol.id }, defaults: { price: 20.00, description: '高水平陪玩，聊天开黑', audit_status: 'approved', status: true } })

  console.log('Seed completed')
  process.exit(0)
}

run().catch(err => { console.error(err); process.exit(1) })
