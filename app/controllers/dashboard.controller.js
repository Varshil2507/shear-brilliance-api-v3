const db = require("../models");
const Salon = db.Salon;
const Barber = db.Barber;
const Appointment = db.Appointment;
const AppointmentService = db.AppointmentService;
const Service =db.Service;
const User = db.USER;
const UserSalon = db.UserSalon;
const { role } = require('../config/roles.config');
const jwt = require('jsonwebtoken');
const roles = db.roles;
const { Op } = require('sequelize'); // Make sure you import Op from Sequelize for date comparisons
const moment = require('moment'); // You can use the moment library to easily work with dates
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const sendResponse = require('../helpers/responseHelper');  // Import the helper
const { put } = require('@vercel/blob'); // Import 'put' directly if using Vercel's blob SDK upload method
const AWS = require('aws-sdk');

const s3 = new AWS.S3({
    endpoint: new AWS.Endpoint('https://tor1.digitaloceanspaces.com'), // Replace with your DigitalOcean Spaces endpoint
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

//common Dashboard 
exports.getDashboardData = async (req, res) => {
    try {
        // Step 1: Extract the userId from the JWT token (req.user should already have the decoded token)
        const userId = req.user ? req.user.id : null;

        if (!userId) {
            return res.status(401).json({ success: false, message: 'Unauthorized: No user ID found', code: 401 });
        }

        // Step 2: Fetch the user and their role (ensure the role is included in the query)
        const user = await User.findByPk(userId, { include: {
            model: roles,  // Include the associated Role model
            as: 'role',    // Alias for the Role model (adjust based on your model's actual alias)
        } });

        if (!user || !user.role) {
            return res.status(403).json({ success: false, message: 'Unauthorized User' });
        }

        const userRole = user.role.role_name;

        // Step 3: Collect data based on role
        let data = {};

        if (userRole === role.ADMIN) {
            // Admin specific data
            const customerRole = await db.roles.findOne({ where: { role_name: role.CUSTOMER } });
            const barberRole = await db.roles.findOne({ where: { role_name: role.BARBER } });
            const salonOwnerRole = await db.roles.findOne({ where: { role_name: role.SALON_OWNER } });
            const adminRole = await db.roles.findOne({ where: { role_name: role.ADMIN } });
            
            if (!customerRole || !barberRole || !salonOwnerRole || !adminRole) {
                return res.status(400).json({ success: false, message: 'One or more roles not found' });
            }

            // Most Famous Salons (Top 3 salons with the highest number of appointments)
            const topSalons = await Appointment.findAll({
                attributes: ['SalonId', [db.sequelize.fn('COUNT', db.sequelize.col('id')), 'appointmentsCount']],
                group: ['SalonId'],
                order: [[db.sequelize.fn('COUNT', db.sequelize.col('id')), 'DESC']],
                limit: 3
            });

            // Fetch salon details for the top 3 salons
            const salonIds = topSalons.map(salon => salon.SalonId);
            const salonData = await Salon.findAll({
                where: {
                    id: salonIds
                },
                attributes: ['id', 'name']  // Fetch salon details like id and name
            });

            // Combine salon data with appointment counts
            const topSalonsWithDetails = topSalons.map(salon => {
                const salonDetails = salonData.find(s => s.id === salon.SalonId);
                return {
                    salonId: salon.SalonId,
                    appointmentsCount: salon.dataValues.appointmentsCount,
                    salonName: salonDetails ? salonDetails.name : 'Unknown'
                };
            });

            // Most Famous Barbers (Top 3 barbers with the highest number of appointments)
            const topBarbers = await Appointment.findAll({
                attributes: ['BarberId', [db.sequelize.fn('COUNT', db.sequelize.col('id')), 'appointmentsCount']],
                group: ['BarberId'],
                order: [[db.sequelize.fn('COUNT', db.sequelize.col('id')), 'DESC']],
                limit: 3
            });

            // Fetch barber details for the top 3 barbers
            const barberIds = topBarbers.map(barber => barber.BarberId);
            const barberData = await Barber.findAll({
                where: {
                    id: barberIds
                },
                attributes: ['id', 'name']  // Fetch barber details like id and name
            });

            // Combine barber data with appointment counts
            const topBarbersWithDetails = topBarbers.map(barber => {
                const barberDetails = barberData.find(b => b.id === barber.BarberId);
                return {
                    barberId: barber.BarberId,
                    appointmentsCount: barber.dataValues.appointmentsCount,
                    barberName: barberDetails ? barberDetails.name : 'Unknown'
                };
            });

             // Fetch top 3 services by number of appointments
             const topServices = await AppointmentService.findAll({
                attributes: [
                    'ServiceId',
                    [db.sequelize.fn('COUNT', db.sequelize.col('AppointmentId')), 'usageCount']
                ],
                group: ['ServiceId'],
                order: [[db.sequelize.fn('COUNT', db.sequelize.col('AppointmentId')), 'DESC']],
                limit: 3,
            });

            // Fetch service details
            const serviceIds = topServices.map(service => service.ServiceId);
            const serviceDetails = await Service.findAll({
                where: { id: serviceIds },
                attributes: ['id', 'name', 'description','isActive'], // Add relevant fields
            });

            const topServicesWithDetails = topServices.map(service => {
                const serviceInfo = serviceDetails.find(s => s.id === service.ServiceId);
                return {
                    serviceId: service.ServiceId,
                    usageCount: service.dataValues.usageCount,
                    serviceName: serviceInfo ? serviceInfo.name : 'Unknown',
                    serviceDescription: serviceInfo ? serviceInfo.description : 'No description',
                    serviceMaxPrice: serviceInfo ? serviceInfo.max_price : null,
                    serviceMinPrice: serviceInfo ? serviceInfo.min_price : null,
                    serviceisActive: serviceInfo ? serviceInfo.isActive : 'Not found',
                };
            });

            data = {
               
                // totalAdmins: await User.count({ where: { RoleId: adminRole.id } }),
                totalBarbers: await Barber.count(),
                // totalSalonOwners: await User.count({ where: { RoleId: salonOwnerRole.id}}),
                totalCustomers: await User.count({ where: { RoleId: customerRole.id } }), // Use customerRole.id
                totalSalons: await Salon.count(),
                totalAppointments: await Appointment.count(),
                activeAppointmentsCount: await Appointment.count({ where: { status: 'in_salon' } }), // Active appointments only with 'in_salon' status
                pendingFutureAppointmentsCount: await Appointment.count({ where: { status: 'appointment' } }), // Pending appointments
                pendingAppointmentsCount: await Appointment.count({ where: { status: 'checked_in' } }), // Pending appointments
                completedAppointmentsCount: await Appointment.count({ where: { status: 'completed',appointment_date: {
                    [Op.ne]: null,
                },  } }),
                completedWalkInCount: await Appointment.count({ where: { status: 'completed',appointment_date: null  } }),
                canceledAppointmentsCount: await Appointment.count({ where: { status: 'canceled' } }),
                totalService : await Service.count(),
                topSalonsWithDetails,
                topBarbersWithDetails,
                topServicesWithDetails
           
            };


        } else if (userRole === role.SALON_OWNER || userRole === role.SALON_MANAGER) {

            let salonOwnerSalons = [];
            if(userRole == role.SALON_OWNER){
                // Salon Owner specific data
             salonOwnerSalons = await Salon.findAll({ where: { UserId: userId } });

            if (salonOwnerSalons.length === 0) {
                return res.status(404).json({ success: false, message: 'No salons found for this role' });
            } 
            }
            else{
                salonOwnerSalons = await Salon.findAll({ where: { id: req.user.salonId } });
            }

            // Collecting active appointments for the owned salons (only 'in_salon' status)
            const activeAppointmentsCount = await Appointment.count({
                where: {
                    SalonId: salonOwnerSalons.map(salon => salon.id),
                    status: 'in_salon'  // Only active appointments with 'in_salon' status
                }
            });

            const pendingAppointmentsCount = await Appointment.count({
                where: {
                    SalonId: salonOwnerSalons.map(salon => salon.id),
                    status: 'checked_in'  // Pending appointments (checked_in)
                }
            });

            const pendingFutureAppointmentsCount = await Appointment.count({
                where: {
                    SalonId: salonOwnerSalons.map(salon => salon.id),
                    status: 'appointment',
                    appointment_date: null
                }
            });

            const completedAppointmentsCount = await Appointment.count({
                where: {
                    SalonId: salonOwnerSalons.map(salon => salon.id),
                    status: 'completed',
                    appointment_date: {
                        [Op.ne]: null,
                    }, 
                }
            });
            const completedWalkInCount = await Appointment.count({
                where: {
                    SalonId: salonOwnerSalons.map(salon => salon.id),
                    status: 'completed',
                    appointment_date: null
                }
            });

            
            const canceledAppointmentsCount = await Appointment.count({
                where: {
                    SalonId: salonOwnerSalons.map(salon => salon.id),
                    status: 'canceled'
                }
            });
            const totalCustomers = await Appointment.count({
                distinct: true,
                col: 'UserId',  // Count distinct users (customers)
                where: {
                    SalonId: salonOwnerSalons.map(salon => salon.id),
                    status: { [Op.in]: ['checked_in', 'in_salon', 'completed', 'canceled'] }  // Including all statuses
                }
            });

            const totalBarbers = await Barber.count({
                where: {
                    SalonId: salonOwnerSalons.map(salon => salon.id)
                }
            });

            const totalAppointments = await Appointment.count({
                where: {
                    SalonId: salonOwnerSalons.map(salon => salon.id)
                }
            });

            data = {
                totalBarbers,
                totalCustomers,
                totalAppointments,
                activeAppointmentsCount,
                pendingAppointmentsCount,
                completedAppointmentsCount,
                completedWalkInCount,
                canceledAppointmentsCount,
                pendingFutureAppointmentsCount
            };

        } else if (userRole === role.SALON_MANAGER) {
             // Fetch the first salon associated with the salon manager
             const userSalon = await UserSalon.findOne({ where: { UserId: user.id } });
        
             if (!userSalon) {
                 return res.status(404).json({ success: false, message: 'No salons found for this manager' });
             }
         
             // Fetch the details of the salon
             const salonRole = await Salon.findOne({ where: { id: userSalon.SalonId } });
             if (!salonRole) {
                 return res.status(404).json({ success: false, message: 'Salon not found' });
             }
         
             const salonId = salonRole.id;
         
             // Fetch active appointments for the managed salon
             const activeAppointmentsCount = await Appointment.count({
                 where: {
                     SalonId: salonId,
                     status: 'in_salon', // Active appointments only with 'in_salon' status
                 },
             });
         
             // Fetch pending appointments for the managed salon
             const pendingAppointmentsCount = await Appointment.count({
                 where: {
                     SalonId: salonId,
                     status: 'checked_in', // Pending appointments
                 },
             });
         
             // Fetch completed appointments for the managed salon
             const completedAppointmentsCount = await Appointment.count({
                 where: {
                     SalonId: salonId,
                     status: 'completed',
                     appointment_date: {
                        [Op.ne]: null,
                    }, 
                 },
             });

          
            const completedWalkInCount = await Appointment.count({
                where: {
                    SalonId: salonId,
                    status: 'completed',
                    appointment_date: null
                }
            });
         
             // Fetch canceled appointments for the managed salon
             const canceledAppointmentsCount = await Appointment.count({
                 where: {
                     SalonId: salonId,
                     status: 'canceled',
                 },
             });
         
             // Count distinct customers for the managed salon
             const totalCustomers = await Appointment.count({
                 distinct: true,
                 col: 'UserId', // Count distinct users (customers)
                 where: {
                     SalonId: salonId,
                     status: { [Op.in]: ['checked_in', 'in_salon', 'completed', 'canceled'] },
                 },
             });
         
             // Count barbers for the managed salon
             const totalBarbers = await Barber.count({
                 where: {
                     SalonId: salonId,
                 },
             });
         
             // Count total appointments for the managed salon
             const totalAppointments = await Appointment.count({
                 where: {
                     SalonId: salonId,
                 },
             });
         
             // Prepare response data
             data = {
                 totalBarbers,
                 totalCustomers,
                 totalAppointments,
                 activeAppointmentsCount,
                 pendingAppointmentsCount,
                 completedAppointmentsCount,
                 completedWalkInCount,
                 canceledAppointmentsCount,
                 managedSalon: {
                     id: salonRole.id,
                     name: salonRole.name,
                     address: salonRole.address,
                     city: salonRole.city,
                 },
             };
        } 
        else if (userRole === role.BARBER) {
            // Barber specific data
            const barber = await db.Barber.findOne({ where: { UserId: userId } });

            if (!barber) {
                return res.status(404).json({ success: false, message: 'Barber not found' });
            }

            // Fetch active appointments for the barber (only 'in_salon' status)
            const activeAppointmentsCount = await Appointment.count({
                where: { BarberId: barber.id, status: 'in_salon' } // Active appointments only with 'in_salon' status
            });

            const pendingAppointmentsCount = await Appointment.count({
                where: { BarberId: barber.id, status: 'checked_in' } // Pending appointments for barber
            });

            const pendingFutureAppointmentsCount = await Appointment.count({
                where: { BarberId: barber.id, status: 'appointment' } // Pending appointments for barber
            });
            const completedAppointmentsCount = await Appointment.count({
                where: { BarberId: barber.id, status: 'completed',  appointment_date: {
                    [Op.ne]: null,
                },  }
            });
            const completedWalkInCount = await Appointment.count({
                where: { BarberId: barber.id, status: 'completed', appointment_date: null  }
            });
            const canceledAppointmentsCount = await Appointment.count({
                where: { BarberId: barber.id, status: 'canceled' }
            });

            const totalAppointments = await Appointment.count({
                where: {
                    BarberId: barber.id
                }
            });
            data = {
                totalAppointments,
                activeAppointmentsCount,
                pendingAppointmentsCount,
                completedAppointmentsCount,
                completedWalkInCount,
                canceledAppointmentsCount,
                pendingFutureAppointmentsCount
            };

        } else {
            return res.status(403).json({ success: false, message: 'Role not authorized' });
        }

        // Step 4: Send response with the collected data
        res.json({
            success: true,
            message: `${userRole} Dashboard Data`,
            data,
            code: 200
        });

    } catch (error) {
        console.error('Error fetching dashboard data:', error);
        res.status(500).json({ success: false, message: 'Server Error', code: 500 });
    }
};

//Dashboard for Appointment
exports.getAppointmentDashboardData = async (req, res) => {
    try {
        // Step 1: Extract the userId from the JWT token (req.user should already have the decoded token)
        const userId = req.user ? req.user.id : null;

        if (!userId) {
            return res.status(401).json({ success: false, message: 'Unauthorized: No user ID found', code: 401 });
        }

        // Step 2: Fetch the user and their role (ensure the role is included in the query)
        const user = await User.findByPk(userId, { include: {
            model: roles,  // Include the associated Role model
            as: 'role',    // Alias for the Role model (adjust based on your model's actual alias)
        } });

        if (!user || !user.role) {
            return res.status(403).json({ success: false, message: 'Unauthorized User' });
        }

        const userRole = user.role.role_name;

        // Step 3: Get today's date range (start of the day to end of the day)
        const startOfDay = moment().startOf('day').toDate(); // Beginning of today
        const endOfDay = moment().endOf('day').toDate(); // End of today

        // Step 4: Collect data based on role
        let data = {};

        if (userRole === role.ADMIN) {
            // Admin specific data for today
            data = {
                totalAppointments: await Appointment.count({
                    where: {
                        createdAt: { [Op.between]: [startOfDay, endOfDay] },
                        appointment_date : null
                    }
                }),
                pendingAppointmentsCount: await Appointment.count({
                    where: {
                        status: 'checked_in',
                        createdAt: { [Op.between]: [startOfDay, endOfDay] },
                        appointment_date : null
                    }
                }),
                completedAppointmentsCount: await Appointment.count({
                    where: {
                        status: 'completed',
                        createdAt: { [Op.between]: [startOfDay, endOfDay] },
                        appointment_date : null
                    }
                }),
                canceledAppointmentsCount: await Appointment.count({
                    where: {
                        status: 'canceled',
                        createdAt: { [Op.between]: [startOfDay, endOfDay] },
                        appointment_date : null
                    }
                }),
                activeAppointmentsCount: await Appointment.count({
                    where: {
                        status: 'in_salon',  // Count appointments with status 'in_salon'
                        createdAt: { [Op.between]: [startOfDay, endOfDay] },
                        appointment_date : null
                    }
                })
            };

        } else if (userRole === role.SALON_OWNER) {
            // Salon Owner specific data for today
            const salonOwnerSalons = await Salon.findAll({ where: { UserId: userId } });

            if (salonOwnerSalons.length === 0) {
                return res.status(404).json({ success: false, message: 'No salons found for this owner' });
            }

            // Collecting the number of appointments for today for owned salons
            data = {
                totalAppointments: await Appointment.count({
                    where: {
                        SalonId: salonOwnerSalons.map(salon => salon.id),
                        createdAt: { [Op.between]: [startOfDay, endOfDay] },
                        appointment_date : null
                    }
                }),
                pendingAppointmentsCount: await Appointment.count({
                    where: {
                        SalonId: salonOwnerSalons.map(salon => salon.id),
                        status: 'checked_in',
                        createdAt: { [Op.between]: [startOfDay, endOfDay] },
                        appointment_date : null
                    }
                }),
                completedAppointmentsCount: await Appointment.count({
                    where: {
                        SalonId: salonOwnerSalons.map(salon => salon.id),
                        status: 'completed',
                        createdAt: { [Op.between]: [startOfDay, endOfDay] },
                        appointment_date : null
                    }
                }),
                canceledAppointmentsCount: await Appointment.count({
                    where: {
                        SalonId: salonOwnerSalons.map(salon => salon.id),
                        status: 'canceled',
                        createdAt: { [Op.between]: [startOfDay, endOfDay] },
                        appointment_date : null
                    }
                }),
                activeAppointmentsCount: await Appointment.count({
                    where: {
                        SalonId: salonOwnerSalons.map(salon => salon.id),
                        status: 'in_salon',  // Count appointments with status 'in_salon'
                        createdAt: { [Op.between]: [startOfDay, endOfDay] },
                        appointment_date : null
                    }
                })
            };

        } else if(userRole=== role.SALON_MANAGER) {
            // Fetch the first salon associated with the salon manager
            const userSalon = await UserSalon.findOne({ where: { UserId: user.id } });
        
            if (!userSalon) {
                return res.status(404).json({ success: false, message: 'No salons found for this manager' });
            }
        
            // Fetch the details of the salon
            const salonRole = await Salon.findOne({ where: { id: userSalon.SalonId } });
            if (!salonRole) {
                return res.status(404).json({ success: false, message: 'Salon not found' });
            }
        
            const salonId = salonRole.id;
        
            // Fetch active appointments for the managed salon
            const activeAppointmentsCount = await Appointment.count({
                where: {
                    SalonId: salonId,
                    appointment_date : null,
                    status: 'in_salon', // Active appointments only with 'in_salon' status
                },
            });
        
            // Fetch pending appointments for the managed salon
            const pendingAppointmentsCount = await Appointment.count({
                where: {
                    SalonId: salonId,
                    appointment_date : null,
                    status: 'checked_in', // Pending appointments
                },
            });
        
            // Fetch completed appointments for the managed salon
            const completedAppointmentsCount = await Appointment.count({
                where: {
                    SalonId: salonId,
                    appointment_date : null,
                    status: 'completed',
                },
            });
        
            // Fetch canceled appointments for the managed salon
            const canceledAppointmentsCount = await Appointment.count({
                where: {
                    SalonId: salonId,
                    appointment_date : null,
                    status: 'canceled',
                },
            });
        
            // Count distinct customers for the managed salon
            const totalCustomers = await Appointment.count({
                distinct: true,
                col: 'UserId', // Count distinct users (customers)
                where: {
                    SalonId: salonId,
                    appointment_date : null,
                    status: { [Op.in]: ['checked_in', 'in_salon', 'completed', 'canceled'] },
                },
            });
        
            // Count barbers for the managed salon
            const totalBarbers = await Barber.count({
                where: {
                    SalonId: salonId,
                },
            });
        
            // Count total appointments for the managed salon
            const totalAppointments = await Appointment.count({
                where: {
                    SalonId: salonId,
                },
            });
        
            // Prepare response data
            data = {
                totalBarbers,
                totalCustomers,
                totalAppointments,
                activeAppointmentsCount,
                pendingAppointmentsCount,
                completedAppointmentsCount,
                canceledAppointmentsCount,
                managedSalon: {
                    id: salonRole.id,
                    name: salonRole.name,
                    address: salonRole.address,
                    city: salonRole.city,
                },
            };
        } else if (userRole === role.BARBER) {
            // Barber specific data for today
            const barber = await db.Barber.findOne({ where: { UserId: userId } });

            if (!barber) {
                return res.status(404).json({ success: false, message: 'Barber not found' });
            }

            // Fetching the total number of appointments for today for the barber
            data = {
                totalAppointments: await Appointment.count({
                    where: {
                        BarberId: barber.id,
                        createdAt: { [Op.between]: [startOfDay, endOfDay] },
                        appointment_date : null
                    }
                }),
                pendingAppointmentsCount: await Appointment.count({
                    where: {
                        BarberId: barber.id,
                        status: 'checked_in',
                        createdAt: { [Op.between]: [startOfDay, endOfDay] },
                        appointment_date : null
                    }
                }),
                completedAppointmentsCount: await Appointment.count({
                    where: {
                        BarberId: barber.id,
                        status: 'completed',
                        createdAt: { [Op.between]: [startOfDay, endOfDay] },
                        appointment_date : null
                    }
                }),
                canceledAppointmentsCount: await Appointment.count({
                    where: {
                        BarberId: barber.id,
                        status: 'canceled',
                        appointment_date : null,
                        createdAt: { [Op.between]: [startOfDay, endOfDay] }
                    }
                }),
                activeAppointmentsCount: await Appointment.count({
                    where: {
                        BarberId: barber.id,
                        status: 'in_salon',  // Count appointments with status 'in_salon'
                        createdAt: { [Op.between]: [startOfDay, endOfDay] },
                        appointment_date : null
                    }
                })
            };

        } else {
            return res.status(403).json({ success: false, message: 'Role not authorized' });
        }

        // Step 5: Send response with the collected data
        res.json({
            success: true,
            message: `${userRole} Appointment Dashboard Data for Today`,
            data,
            code: 200
        });

    } catch (error) {
        console.error('Error fetching appointment dashboard data:', error);
        res.status(500).json({ success: false, message: 'Server Error', code: 500 });
    }
};


const generatePDF = async (doc, filePath) => {
    return new Promise((resolve, reject) => {
        const writeStream = fs.createWriteStream(filePath);
        doc.pipe(writeStream);

        writeStream.on('finish', () => resolve(filePath));
        writeStream.on('error', (error) => reject(error));
        doc.end();
    });
};

// Ensure the reports directory exists
const ensureDirectoryExists = (filePath) => {
    const dirPath = path.dirname(filePath);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
};


exports.generateAdminAppointmentReport = async (req, res) => {
    try {
        const userId = req.user ? req.user.id : null;

        if (!userId) {
            return res.status(401).json({ success: false, message: 'Unauthorized: No user ID found', code: 401 });
        }

        const user = await User.findByPk(userId, {
            include: {
                model: roles,
                as: 'role',
            }
        });

        if (!user || !user.role) {
            return res.status(403).json({ success: false, message: 'Unauthorized User' });
        }

        const userRole = user.role.role_name;
        const salonId = req.user.salonId;

        // Extract and validate dates
        const { startDate, endDate } = req.query;
        if (!startDate || !endDate) {
            return res.status(400).json({ 
                success: false, 
                message: "Start date and end date are required" 
            });
        }

        if (isNaN(new Date(startDate).getTime()) || isNaN(new Date(endDate).getTime())) {
            return res.status(400).json({ success: false, message: "Invalid date format" });
        }

        let data = {};

        if (userRole === role.ADMIN || userRole === role.SALON_OWNER) {
            // Base query conditions
            let whereConditions = {
                createdAt: { [Op.between]: [new Date(startDate), new Date(endDate)] }
            };

            // Add salon filter for salon owner
            if (userRole === role.SALON_OWNER) {
                whereConditions.SalonId = salonId;
            }

            // Fetch appointment data
            data = {
                totalAppointments: await Appointment.count({
                    where: whereConditions
                }),
                pendingAppointmentsCount: await Appointment.count({
                    where: {
                        ...whereConditions,
                        status: 'checked_in'
                    }
                }),
                completedAppointmentsCount: await Appointment.count({
                    where: {
                        ...whereConditions,
                        status: 'completed'
                    }
                }),
                canceledAppointmentsCount: await Appointment.count({
                    where: {
                        ...whereConditions,
                        status: 'canceled'
                    }
                }),
                activeAppointmentsCount: await Appointment.count({
                    where: {
                        ...whereConditions,
                        status: 'in_salon'
                    }
                })
            };

            // Fetch totals based on role
            const customerRole = await roles.findOne({ where: { role_name: role.CUSTOMER } });

            if (!customerRole) {
                return sendResponse(res, false, "Customer role not found", null, 404);
            }

            let totalSalons, totalCustomers, totalBarbers, allBarbers;

            if (userRole === role.ADMIN) {
                [totalSalons, totalCustomers, totalBarbers, allBarbers] = await Promise.all([
                    Salon.count(),
                    User.count({ where: { RoleId: customerRole.id } }),
                    Barber.count(),
                    Barber.findAll()
                ]);
            } else {
                [totalSalons, totalCustomers, totalBarbers, allBarbers] = await Promise.all([
                    Salon.count({ where: { id: salonId } }),
                    User.count({ where: { RoleId: customerRole.id, id: salonId } }),
                    Barber.count({ where: { SalonId: salonId } }),
                    Barber.findAll({ where: { SalonId: salonId } })
                ]);
            }

            data.totalSalons = totalSalons;
            data.totalCustomers = totalCustomers;
            data.totalBarbers = totalBarbers;

            // Fetch barber statistics
            let barbersData = await Promise.all(allBarbers.map(async (barber) => {
                const whereClause = { BarberId: barber.id };
                if (userRole === role.SALON_OWNER) {
                    whereClause.SalonId = salonId;
                }

                const [active, pending, completed, canceled] = await Promise.all([
                    Appointment.count({ where: { ...whereClause, status: 'in_salon' } }),
                    Appointment.count({ where: { ...whereClause, status: 'checked_in' } }),
                    Appointment.count({ where: { ...whereClause, status: 'completed' } }),
                    Appointment.count({ where: { ...whereClause, status: 'canceled' } })
                ]);

                return {
                    barberName: barber.name,
                    activeAppointmentsCount: active,
                    pendingAppointmentsCount: pending,
                    completedAppointmentsCount: completed,
                    canceledAppointmentsCount: canceled
                };
            }));

            // Generate PDF
            const fileName = `${userRole.toLowerCase()}_appointment_dashboard_${moment().format('YYYY-MM-DD')}.pdf`;
            const filePath = path.resolve(__dirname, '../public/reports', fileName);
            
            ensureDirectoryExists(filePath);
            const doc = new PDFDocument();

            // Header section
            const titlePrefix = userRole === role.ADMIN ? 'Admin' : 'Salon Owner';
            doc.fontSize(16).text(`Shear Brilliance ${titlePrefix} Dashboard`, { align: 'center' });
            doc.moveDown(1);
            doc.fontSize(12).text(`Report Date: ${moment().format('YYYY-MM-DD')}`, { align: 'center' });
            doc.text(`Date Range: ${startDate} to ${endDate}`, { align: 'center' });
            doc.moveDown(2);

            // Summary section
            doc.fontSize(12).text(`Total Salons: ${data.totalSalons}`, { align: 'center' });
            doc.fontSize(12).text(`Total Customers: ${data.totalCustomers}`, { align: 'center' });
            doc.fontSize(12).text(`Total Barbers: ${data.totalBarbers}`, { align: 'center' });
            doc.moveDown(2);

            // Table section
            const columnWidth = 180;
            const rowHeight = 20;
            const tableWidth = 2 * columnWidth;
            const pageWidth = doc.page.width;
            const marginLeft = (pageWidth - tableWidth) / 2;
            
            const headerY = doc.y;

            // Table headers
            doc.fontSize(12).text('Status', marginLeft, headerY);
            doc.text('Count', marginLeft + columnWidth, headerY);

            doc.moveDown(1);
            doc.lineWidth(1)
                .moveTo(marginLeft, doc.y)
                .lineTo(marginLeft + tableWidth, doc.y)
                .stroke();
            doc.moveDown();

            // Table data
            const tableData = [
                ['Total Appointments', data.totalAppointments],
                ['Pending Appointments', data.pendingAppointmentsCount],
                ['Completed Appointments', data.completedAppointmentsCount],
                ['Canceled Appointments', data.canceledAppointmentsCount],
                ['Active Appointments', data.activeAppointmentsCount]
            ];

            tableData.forEach((row) => {
                const yPosition = doc.y;
                doc.text(row[0], marginLeft, yPosition);
                doc.text(row[1], marginLeft + columnWidth, yPosition);

                doc.moveTo(marginLeft, yPosition + rowHeight)
                    .lineTo(marginLeft + tableWidth, yPosition + rowHeight)
                    .stroke();

                doc.moveDown(1);
            });

            // Barber details page
            doc.addPage();
            doc.fontSize(14).text('Barber Details', { align: 'center' });
            doc.moveDown(1);

            barbersData.forEach(barber => {
                doc.fontSize(12).text(`Barber: ${barber.barberName}`, { align: 'left' });
                doc.text(`Active Appointments: ${barber.activeAppointmentsCount}`, { align: 'left' });
                doc.text(`Pending Appointments: ${barber.pendingAppointmentsCount}`, { align: 'left' });
                doc.text(`Completed Appointments: ${barber.completedAppointmentsCount}`, { align: 'left' });
                doc.text(`Canceled Appointments: ${barber.canceledAppointmentsCount}`, { align: 'left' });
                doc.moveDown(1);
            });

            try {
                await generatePDF(doc, filePath);
                const fileBuffer = fs.readFileSync(filePath);

                const uploadParams = {
                    Bucket: process.env.DO_SPACES_BUCKET,
                    Key: `reports/${fileName}`,
                    Body: fileBuffer,
                    ACL: 'public-read',
                    ContentType: 'application/pdf',
                };

                const uploadResult = await s3.upload(uploadParams).promise();
                
                // Clean up local file
                fs.unlinkSync(filePath);

                res.status(200).json({
                    success: true,
                    message: 'PDF report generated successfully',
                    downloadLink: uploadResult.Location,
                });
            } catch (err) {
                console.error('Error in PDF generation or upload:', err);
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                }
                res.status(500).json({ 
                    success: false, 
                    message: 'Error generating or uploading PDF report',
                    error: err.message 
                });
            }
        } else {
            return res.status(403).json({ success: false, message: 'Role not authorized' });
        }
    } catch (error) {
        console.error('Error generating admin appointment report:', error);
        res.status(500).json({ success: false, message: 'Server Error', code: 500 });
    }
};

// Helper function to calculate date ranges
const getDateRange = (filter) => {
    const today = new Date();
    let startDate;
  
    switch (filter) {
      case 'today':
        startDate = new Date(today.setHours(0, 0, 0, 0));
        return { startDate, endDate: new Date(today.setHours(23, 59, 59, 999)) };
      case 'last_7_days':
        startDate = new Date(today.setDate(today.getDate() - 7));
        return { startDate, endDate: new Date() };
      case 'last_30_days':
        startDate = new Date(today.setDate(today.getDate() - 30));
        return { startDate, endDate: new Date() };
      default:
        throw new Error('Invalid filter');
    }
  };

exports.appointmentStatus = async (req, res) => {
    const { filter } = req.query;
    try {

        // Step 1: Extract the userId from the JWT token (req.user should already have the decoded token)
        const userId = req.user ? req.user.id : null;

        if (!userId) {
              return res.status(401).json({ success: false, message: 'Unauthorized: No user ID found', code: 401 });
        }
  
          // Step 2: Fetch the user and their role (ensure the role is included in the query)
        const user = await User.findByPk(userId, { include: {
              model: roles,  // Include the associated Role model
              as: 'role',    // Alias for the Role model (adjust based on your model's actual alias)
        } });
  
        if (!user || !user.role) {
              return res.status(403).json({ success: false, message: 'Unauthorized User' });
        }
  
        const userRole = user.role.role_name;

       // Validate filter
    if (!filter || !['today', 'last_7_days', 'last_30_days'].includes(filter)) {
        return res.status(400).json({ error: 'Invalid filter' });
      }
  
      // Get date range
      const { startDate, endDate } = getDateRange(filter);
  
      let appointmentCounts = [];
      if (userRole === role.ADMIN) {
         // Query database for aggregated data
         appointmentCounts = await Appointment.findAll({
            attributes: [
            'status',
            [db.sequelize.fn('COUNT', db.sequelize.col('id')), 'count'],
            ],
            where: {
                createdAt: {
                [Op.between]: [startDate, endDate],
            },
            },
            group: ['status'],
        });   
      }
      else if(userRole === role.SALON_OWNER){
        appointmentCounts = await Appointment.findAll({
            attributes: [
            'status',
            [db.sequelize.fn('COUNT', db.sequelize.col('id')), 'count'],
            ],
            where: {
                createdAt: {
                    [Op.between]: [startDate, endDate]
                },
                SalonId: req.user.salonId
            },
            group: ['status'],
        });   
      }
      else if(userRole === role.SALON_MANAGER){
        appointmentCounts = await Appointment.findAll({
            attributes: [
            'status',
            [db.sequelize.fn('COUNT', db.sequelize.col('id')), 'count'],
            ],
            where: {
                createdAt: {
                    [Op.between]: [startDate, endDate]
                },
                SalonId: req.user.salonId
            },
            group: ['status'],
        });   
      }
      else if(userRole === role.BARBER){
        console.log('BarberId:', req.user.barberId); // Debugging log
        appointmentCounts = await Appointment.findAll({
            attributes: [
            'status',
            [db.sequelize.fn('COUNT', db.sequelize.col('id')), 'count'],
            ],
            where: {
                createdAt: {
                    [Op.between]: [startDate, endDate]
                },
                BarberId: req.user.barberId
            },
            group: ['status'],
        });   
      }

      // Format the response
      const response = appointmentCounts.map((item) => ({
        status: item.status,
        count: item.dataValues.count,
      }));

        // Step 4: Send response with the collected data
        res.json({
            success: true,
            message: `Get appointment status succesfully !!!`,
            response,
            code: 200
        });

    } catch (error) {
        console.error('Error while Get appointment status !!!', error);
        res.status(500).json({ success: false, message: 'Server Error', code: 500 });
    }
};

exports.GetnewCustomers = async (req, res) => {
    const { filter } = req.query;
    try {

        // Step 1: Extract the userId from the JWT token (req.user should already have the decoded token)
        const userId = req.user ? req.user.id : null;

        if (!userId) {
              return res.status(401).json({ success: false, message: 'Unauthorized: No user ID found', code: 401 });
        }
  
          // Step 2: Fetch the user and their role (ensure the role is included in the query)
        const user = await User.findByPk(userId, { include: {
              model: roles,  // Include the associated Role model
              as: 'role',    // Alias for the Role model (adjust based on your model's actual alias)
        } });
  
        if (!user || !user.role) {
              return res.status(403).json({ success: false, message: 'Unauthorized User' });
        }
  
        const userRole = user.role.role_name;

       // Validate filter
    if (!filter || !['today', 'last_7_days', 'last_30_days'].includes(filter)) {
        return res.status(400).json({ error: 'Invalid filter' });
      }
  
      // Get date range
      const { startDate, endDate } = getDateRange(filter);
  
      let newCustomerCount = 0;
      if (userRole === role.ADMIN) {
            // Query database for new customers
          newCustomerCount = await User.count({
            where: {
                createdAt: {
                [Op.between]: [startDate, endDate],
                },
            },
            });
       }
    
        // Step 4: Send response with the collected data
        res.json({
            success: true,
            message: `Get new customer succesfully !!!`,
            newCustomerCount,
            code: 200
        });

    } catch (error) {
        console.error('Error generating new customer data', error);
        res.status(500).json({ success: false, message: 'Server Error', code: 500 });
    }
};
