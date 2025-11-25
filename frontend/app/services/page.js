"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BookOpen, MapPin, Building, Utensils, Heart, ExternalLink, Phone, Clock, Star } from "lucide-react"

export default function ServicesPage() {
  const [selectedService, setSelectedService] = useState("hostels")

  // Sample data - in real app, this would come from your backend/API
  const collegeLocation = {
    name: "Shri Ramdeobaba College of Engineering, Ramdeobaba University (RBU), Nagpur",
    coordinates: "21.177189, 79.061721", // Example coordinates for Delhi
    address: "Ramdeo Tekdi, Gittikhadan, Katol Road, Nagpur – 440 013",
  }

  const services = {
    hostels: [
      {
        id: 1,
        name: "Green Valley Hostel",
        type: "Boys Hostel",
        distance: "0.5 km",
        rating: 4.2,
        price: "₹8,000/month",
        amenities: ["WiFi", "Mess", "Laundry", "Security"],
        contact: "+91 98765 43210",
        address: "Near Main Gate, College Road",
        image: "/placeholder.svg?height=200&width=300",
      },
      {
        id: 2,
        name: "Sunrise Girls Hostel",
        type: "Girls Hostel",
        distance: "0.8 km",
        rating: 4.5,
        price: "₹9,500/month",
        amenities: ["WiFi", "Mess", "Gym", "Security", "AC"],
        contact: "+91 98765 43211",
        address: "University Road, Block A",
        image: "/placeholder.svg?height=200&width=300",
      },
      {
        id: 3,
        name: "Campus View PG",
        type: "Co-ed PG",
        distance: "1.2 km",
        rating: 4.0,
        price: "₹7,500/month",
        amenities: ["WiFi", "Kitchen", "Parking", "Security"],
        contact: "+91 98765 43212",
        address: "Behind Shopping Complex",
        image: "/placeholder.svg?height=200&width=300",
      },
    ],
    mess: [
      {
        id: 1,
        name: "Annapurna Mess",
        type: "Vegetarian",
        distance: "0.3 km",
        rating: 4.3,
        price: "₹3,500/month",
        timings: "7 AM - 10 PM",
        speciality: "North Indian, South Indian",
        contact: "+91 98765 43213",
        address: "Main Market, College Road",
        image: "/placeholder.svg?height=200&width=300",
      },
      {
        id: 2,
        name: "Spice Garden",
        type: "Multi-cuisine",
        distance: "0.7 km",
        rating: 4.1,
        price: "₹4,200/month",
        timings: "6 AM - 11 PM",
        speciality: "Continental, Chinese, Indian",
        contact: "+91 98765 43214",
        address: "University Square",
        image: "/placeholder.svg?height=200&width=300",
      },
      {
        id: 3,
        name: "Healthy Bites",
        type: "Health Food",
        distance: "1.0 km",
        rating: 4.4,
        price: "₹4,800/month",
        timings: "7 AM - 9 PM",
        speciality: "Organic, Salads, Protein-rich",
        contact: "+91 98765 43215",
        address: "Green Park Extension",
        image: "/placeholder.svg?height=200&width=300",
      },
    ],
    hospitals: [
      {
        id: 1,
        name: "City General Hospital",
        type: "Multi-specialty",
        distance: "2.1 km",
        rating: 4.2,
        services: ["Emergency", "OPD", "Pharmacy", "Lab"],
        timings: "24/7",
        contact: "+91 98765 43216",
        address: "Hospital Road, Medical District",
        image: "/placeholder.svg?height=200&width=300",
      },
      {
        id: 2,
        name: "HealthCare Plus Clinic",
        type: "General Practice",
        distance: "0.9 km",
        rating: 4.0,
        services: ["General Medicine", "Dental", "Physiotherapy"],
        timings: "8 AM - 8 PM",
        contact: "+91 98765 43217",
        address: "Shopping Complex, 2nd Floor",
        image: "/placeholder.svg?height=200&width=300",
      },
      {
        id: 3,
        name: "Apollo Pharmacy",
        type: "Pharmacy",
        distance: "0.4 km",
        rating: 4.3,
        services: ["Medicines", "Health Products", "Home Delivery"],
        timings: "7 AM - 11 PM",
        contact: "+91 98765 43218",
        address: "Main Market, Ground Floor",
        image: "/placeholder.svg?height=200&width=300",
      },
    ],
  }

  const getGoogleMapsUrl = (serviceType) => {
    const { coordinates } = collegeLocation
    const searchQuery = encodeURIComponent(`${serviceType} near ${collegeLocation.name}`)
    return `https://www.google.com/maps/search/${searchQuery}/@${coordinates},5z`
  }

  const getDirectionsUrl = (address) => {
    const destination = encodeURIComponent(address)
    return `https://www.google.com/maps/dir/?api=1&destination=${destination}`
  }

  const serviceIcons = {
    hostels: <Building className="h-6 w-6" />,
    mess: <Utensils className="h-6 w-6" />,
    hospitals: <Heart className="h-6 w-6" />,
  }

  const serviceLabels = {
    hostels: "Hostels & PG",
    mess: "Mess & Food",
    hospitals: "Healthcare",
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center space-x-2">
              <BookOpen className="h-8 w-8 text-blue-600" />
              <span className="text-2xl font-bold text-gray-900">CampusCore</span>
            </Link>
            <nav className="hidden md:flex space-x-8">
              <Link href="/notes" className="text-gray-600 hover:text-blue-600 transition-colors">
                Notes
              </Link>
              <Link href="/roadmap" className="text-gray-600 hover:text-blue-600 transition-colors">
                Roadmap
              </Link>
              <Link href="/qna" className="text-gray-600 hover:text-blue-600 transition-colors">
                Q&A
              </Link>
              <Link href="/leaderboard" className="text-gray-600 hover:text-blue-600 transition-colors">
                Leaderboard
              </Link>
              <Link href="/services" className="text-blue-600 font-medium">
                Services
              </Link>
            </nav>
            <Link href="/user">
              <Button variant="outline">Dashboard</Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Campus Services</h1>
          <p className="text-gray-600">
            Find nearby hostels, mess facilities, and hospitals services around your campus
          </p>
        </div>

        {/* Campus Location Info */}
        <Card className="mb-8 bg-blue-50 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <MapPin className="h-8 w-8 text-blue-600" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{collegeLocation.name}</h3>
                <p className="text-gray-600">{collegeLocation.address}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Service Categories */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Service Categories</CardTitle>
                <CardDescription>Choose a service to explore</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.keys(services).map((serviceKey) => (
                    <Button
                      key={serviceKey}
                      variant={selectedService === serviceKey ? "default" : "outline"}
                      className="w-full justify-start"
                      onClick={() => setSelectedService(serviceKey)}
                    >
                      {serviceIcons[serviceKey]}
                      <span className="ml-2">{serviceLabels[serviceKey]}</span>
                    </Button>
                  ))}
                </div>

                {/* Quick Actions */}
                <div className="mt-6 space-y-2">
                  <h4 className="font-medium text-gray-900">Quick Actions</h4>
                  <Button
                    variant="outline"
                    className="w-full justify-start bg-transparent"
                    onClick={() => window.open(getGoogleMapsUrl(selectedService), "_blank")}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View on Google Maps
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Service Listings */}
          <div className="lg:col-span-3">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">{serviceLabels[selectedService]}</h2>
              <Button onClick={() => window.open(getGoogleMapsUrl(selectedService), "_blank")}>
                <ExternalLink className="h-4 w-4 mr-2" />
                View All on Maps
              </Button>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {services[selectedService].map((service) => (
                <Card key={service.id} className="hover:shadow-lg transition-shadow duration-300">
                  <div className="aspect-video bg-gray-200 rounded-t-lg">
                    <img
                      src={service.image || "/placeholder.svg"}
                      alt={service.name}
                      className="w-full h-full object-cover rounded-t-lg"
                    />
                  </div>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{service.name}</CardTitle>
                        <CardDescription>{service.type}</CardDescription>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium">{service.rating}</span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Distance and Price */}
                      <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-1 text-sm text-gray-600">
                          <MapPin className="h-4 w-4" />
                          <span>{service.distance}</span>
                        </div>
                        {service.price && <Badge variant="secondary">{service.price}</Badge>}
                      </div>

                      {/* Amenities/Services */}
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 mb-2">
                          {selectedService === "hospitals" ? "Services" : "Amenities"}
                        </h4>
                        <div className="flex flex-wrap gap-1">
                          {(service.amenities || service.services)?.slice(0, 4).map((item, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {item}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {/* Timings */}
                      {service.timings && (
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <Clock className="h-4 w-4" />
                          <span>{service.timings}</span>
                        </div>
                      )}

                      {/* Speciality */}
                      {service.speciality && (
                        <div>
                          <span className="text-sm text-gray-600">Speciality: {service.speciality}</span>
                        </div>
                      )}

                      {/* Contact and Address */}
                      <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex items-center space-x-2">
                          <Phone className="h-4 w-4" />
                          <span>{service.contact}</span>
                        </div>
                        <div className="flex items-start space-x-2">
                          <MapPin className="h-4 w-4 mt-0.5" />
                          <span>{service.address}</span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          className="flex-1"
                          onClick={() => window.open(`tel:${service.contact}`, "_self")}
                        >
                          <Phone className="h-4 w-4 mr-2" />
                          Call
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 bg-transparent"
                          onClick={() => window.open(getDirectionsUrl(service.address), "_blank")}
                        >
                          <MapPin className="h-4 w-4 mr-2" />
                          Directions
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Empty State */}
            {services[selectedService].length === 0 && (
              <div className="text-center py-12">
                {serviceIcons[selectedService]}
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No {serviceLabels[selectedService].toLowerCase()} found
                </h3>
                <p className="text-gray-600 mb-4">
                  We couldn't find any {serviceLabels[selectedService].toLowerCase()} in your area.
                </p>
                <Button onClick={() => window.open(getGoogleMapsUrl(selectedService), "_blank")}>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Search on Google Maps
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
