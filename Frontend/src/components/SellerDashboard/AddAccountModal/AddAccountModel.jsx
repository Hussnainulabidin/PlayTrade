"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { X, Zap, Truck, Plus } from 'lucide-react'
import "./AddAccountModal.css"
import Step1ListingInfo from "./Steps/Step1ListingInfo"
import Step2ValorantData from "./Steps/Step2ValorantData"
import Step2ClashOfClansData from "./Steps/Step2ClashOfClansData"
import Step2BrawlStarsData from "./Steps/Step2BrawlStarsData"
import Step2FortniteData from "./Steps/Step2FortniteData"
import Step2LeagueOfLegendsData from "./Steps/Step2LeagueOfLegendsData"
import Step3Credentials from "./Steps/Step3Credentials"

const AddAccountModal = ({ isOpen, onClose, initialData, isEditMode = false }) => {
    const [currentStep, setCurrentStep] = useState(1)
    const [formData, setFormData] = useState({
        // Step 1: Listing Info
        title: "",
        slug: "",
        price: "",
        gameType: "Valorant",
        description: "",
        gallery: [],

        // Step 2: Game Data (Valorant)
        server: "",
        current_rank: "Unranked",
        level: 1,
        valorant_points: 0,
        radianite_points: 0,

        // Step 2: Game Data (Clash of Clans)
        town_hall_level: "",
        builder_hall_level: "",
        gems: 0,
        trophies: 0,
        clan: "",

        // Step 2: Game Data (Brawl Stars)
        trophy_range: "",
        brawlers_unlocked: 0,
        club: "",

        // Step 2: Game Data (Fortnite)
        platform: "",
        region: "",
        account_level: 1,
        vbucks: 0,
        skins: 0,
        battle_pass: "",

        // Step 2: Game Data (League of Legends)
        rank: "",
        division: "",
        blue_essence: 0,
        rp: 0,
        champions: 0,

        // Step 3: Credentials
        login: "",
        password: "",
        email_login: "",
        email_password: "",
        in_game_name: "",
        has_2fa: false,
        delivery_instructions: "",
        delivery_type: "instant" // instant or manual
    })
    const [errors, setErrors] = useState({})
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [submitError, setSubmitError] = useState(null)

    // Initialize form data when initialData changes
    useEffect(() => {
        if (initialData) {
            setFormData({
                title: initialData.title || "",
                slug: initialData.slug || "",
                price: initialData.price || "",
                gameType: initialData.gameType || "Valorant",
                description: initialData.description || "",
                gallery: initialData.gallery || [],
                server: initialData.server || "",
                current_rank: initialData.account_data?.current_rank || "Unranked",
                level: initialData.account_data?.level || 1,
                valorant_points: initialData.account_data?.valorant_points || 0,
                radianite_points: initialData.account_data?.radianite_points || 0,
                town_hall_level: initialData.account_data?.town_hall_level || "",
                builder_hall_level: initialData.account_data?.builder_hall_level || "",
                gems: initialData.account_data?.gems || 0,
                trophies: initialData.account_data?.trophies || 0,
                clan: initialData.account_data?.clan || "",
                trophy_range: initialData.account_data?.trophy_range || "",
                brawlers_unlocked: initialData.account_data?.brawlers_unlocked || 0,
                club: initialData.account_data?.club || "",
                platform: initialData.account_data?.platform || "",
                region: initialData.account_data?.region || "",
                account_level: initialData.account_data?.account_level || 1,
                vbucks: initialData.account_data?.vbucks || 0,
                skins: initialData.account_data?.skins || 0,
                battle_pass: initialData.account_data?.battle_pass || "",
                rank: initialData.account_data?.rank || "",
                division: initialData.account_data?.division || "",
                blue_essence: initialData.account_data?.blue_essence || 0,
                rp: initialData.account_data?.rp || 0,
                champions: initialData.account_data?.champions || 0,
                login: initialData.login || "",
                password: initialData.password || "",
                email_login: initialData.email_login || "",
                email_password: initialData.email_password || "",
                in_game_name: initialData.ign || "",
                has_2fa: initialData.has_2fa || false,
                delivery_instructions: initialData.delivery_instructions || "",
                delivery_type: initialData.delivery_type || "instant"
            })
        }
    }, [initialData])

    // Close modal on escape key
    useEffect(() => {
        const handleEsc = (event) => {
            if (event.key === "Escape") {
                onClose()
            }
        }
        window.addEventListener("keydown", handleEsc)
        return () => {
            window.removeEventListener("keydown", handleEsc)
        }
    }, [onClose])

    // Prevent body scrolling when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden"
        } else {
            document.body.style.overflow = "auto"
        }
        return () => {
            document.body.style.overflow = "auto"
        }
    }, [isOpen])

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target
        setFormData(prev => {
            const newData = {
                ...prev,
                [name]: type === "checkbox" ? checked : value
            }

            // Only update slug when title changes
            if (name === "title") {
                const slug = value.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")
                newData.slug = slug
            }

            return newData
        })

        // Clear error for this field when user starts typing
        if (errors[name]) {
            setErrors({
                ...errors,
                [name]: null
            })
        }
    }

    const handleSlugChange = (title) => {
        // Convert title to slug format (lowercase, replace spaces with hyphens)
        const slug = title.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")
        setFormData({
            ...formData,
            slug
        })
    }

    const validateStep = (step) => {
        const newErrors = {}

        if (step === 1) {
            if (!formData.title.trim()) newErrors.title = "Title is required"
            if (!formData.price) newErrors.price = "Price is required"
            if (!formData.gameType) newErrors.gameType = "Game is required"
        }
        else if (step === 2) {
            switch (formData.gameType) {
                case "Valorant":
                    if (!formData.server) newErrors.server = "Server is required"
                    break
                case "Clash of Clans":
                    if (!formData.town_hall_level) newErrors.town_hall_level = "Town Hall Level is required"
                    break
                case "Brawl Stars":
                    if (!formData.trophy_range) newErrors.trophy_range = "Trophy Range is required"
                    break
                case "Fortnite":
                    if (!formData.platform) newErrors.platform = "Platform is required"
                    if (!formData.region) newErrors.region = "Region is required"
                    break
                case "League of Legends":
                    if (!formData.server) newErrors.server = "Server is required"
                    break
                default:
                    break
            }
        }
        else if (step === 3) {
            if (!formData.login.trim()) newErrors.login = "Login is required"
            if (!formData.password.trim()) newErrors.password = "Password is required"
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const nextStep = () => {
        if (validateStep(currentStep)) {
            setCurrentStep(currentStep + 1)
        }
    }

    const prevStep = () => {
        setCurrentStep(currentStep - 1)
    }

    const handleSubmit = async () => {
        if (!validateStep(currentStep)) {
            return;
        }

        setIsSubmitting(true);
        setSubmitError(null);

        try {
            // Format data according to the schema (without gallery)
            const accountData = {
                id: initialData?._id || "",
                title: formData.title,
                description: formData.description,
                price: parseFloat(formData.price),
                login: formData.login,
                password: formData.password,
                email_login: formData.email_login,
                email_password: formData.email_password,
                ign: formData.in_game_name,
                delivery_instructions: formData.delivery_instructions,
                game: formData.gameType,
                account_data: {}
            }

            // Add game-specific data
            switch (formData.gameType) {
                case "Valorant":
                    accountData.server = formData.server
                    accountData.account_data = {
                        current_rank: formData.current_rank,
                        level: parseInt(formData.level),
                        valorant_points: parseInt(formData.valorant_points),
                        radianite_points: parseInt(formData.radianite_points)
                    }
                    break
                case "Clash of Clans":
                    accountData.account_data = {
                        TownHallLevel: parseInt(formData.town_hall_level),
                        BuilderHallLevel: parseInt(formData.builder_hall_level),
                        Gems: parseInt(formData.gems),
                        Trophies: parseInt(formData.trophies),
                        Clan: formData.clan
                    }
                    break
                case "Brawl Stars":
                    accountData.account_data = {
                        TrophyRange: formData.trophy_range,
                        BrawlersUnlocked: parseInt(formData.brawlers_unlocked),
                        Gems: parseInt(formData.gems),
                        Club: formData.club
                    }
                    break
                case "Fortnite":
                    accountData.account_data = {
                        Platform: formData.platform,
                        Region: formData.region,
                        AccountLevel: parseInt(formData.account_level),
                        Vbucks: parseInt(formData.vbucks),
                        Skins: parseInt(formData.skins),
                        BattlePass: formData.battle_pass
                    }
                    break
                case "League of Legends":
                    accountData.server = formData.server
                    accountData.account_data = {
                        Rank: formData.rank,
                        Division: formData.division,
                        Level: parseInt(formData.level),
                        BlueEssence: parseInt(formData.blue_essence),
                        RP: parseInt(formData.rp),
                        Champions: parseInt(formData.champions)
                    }
                    break
            }

            // Add 2FA status
            accountData.has_2fa = formData.has_2fa

            // Add delivery type
            accountData.delivery_type = formData.delivery_type

            if (isEditMode) {
                let response;
                switch (formData.gameType.toLowerCase()) {
                    case "valorant":
                        response = await axios.patch(
                            `http://localhost:3003/valorant/accounts/${initialData?._id}`,
                            accountData,
                            {
                                headers: {
                                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                                }
                            }
                        )
                        console.log('Account updated successfully:', response.data)

                        // Update with gallery in a separate request if there are images
                        if (formData.gallery && formData.gallery.length > 0) {
                            console.log('Preparing to upload images:', formData.gallery);
                            const formDataObj = new FormData();
                            formData.gallery.forEach((file, idx) => {
                                console.log(`Appending file [${idx}]:`, file);
                                formDataObj.append('images', file);
                            });
                            try {
                                const uploadResponse = await axios.put(
                                    `http://localhost:3003/valorant/accounts/${initialData?._id}/pictures`,
                                    formDataObj,
                                    {
                                        headers: {
                                            'Authorization': `Bearer ${localStorage.getItem('token')}`,
                                            'Content-Type': 'multipart/form-data'
                                        }
                                    }
                                );
                                console.log('Image upload response:', uploadResponse.data);
                            } catch (uploadErr) {
                                console.error('Error uploading images:', uploadErr);
                            }
                        }
                        break;
                    case "clash of clans":
                        response = await axios.patch(
                            `http://localhost:3003/clashofclans/${initialData?._id}`,
                            accountData,
                            {
                                headers: {
                                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                                }
                            }
                        )
                        console.log('Account updated successfully:', response.data)

                        // Update with gallery in a separate request if there are images
                        if (formData.gallery && formData.gallery.length > 0) {
                            console.log('Preparing to upload images:', formData.gallery);
                            const formDataObj = new FormData();
                            formData.gallery.forEach((file, idx) => {
                                console.log(`Appending file [${idx}]:`, file);
                                formDataObj.append('images', file);
                            });
                            try {
                                const uploadResponse = await axios.put(
                                    `http://localhost:3003/clashofclans/${initialData?._id}/pictures`,
                                    formDataObj,
                                    {
                                        headers: {
                                            'Authorization': `Bearer ${localStorage.getItem('token')}`,
                                            'Content-Type': 'multipart/form-data'
                                        }
                                    }
                                );
                                console.log('Image upload response:', uploadResponse.data);
                            } catch (uploadErr) {
                                console.error('Error uploading images:', uploadErr);
                            }
                        }
                        break;
                    case "brawl stars":
                        response = await axios.patch(
                            `http://localhost:3003/brawlstars/${initialData?._id}`,
                            accountData,
                            {
                                headers: {
                                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                                }
                            }
                        )
                        console.log('Account updated successfully:', response.data)

                        // Update with gallery in a separate request if there are images
                        if (formData.gallery && formData.gallery.length > 0) {
                            console.log('Preparing to upload images:', formData.gallery);
                            const formDataObj = new FormData();
                            formData.gallery.forEach((file, idx) => {
                                console.log(`Appending file [${idx}]:`, file);
                                formDataObj.append('images', file);
                            });
                            try {
                                const uploadResponse = await axios.put(
                                    `http://localhost:3003/brawlstars/${initialData?._id}/pictures`,
                                    formDataObj,
                                    {
                                        headers: {
                                            'Authorization': `Bearer ${localStorage.getItem('token')}`,
                                            'Content-Type': 'multipart/form-data'
                                        }
                                    }
                                );
                                console.log('Image upload response:', uploadResponse.data);
                            } catch (uploadErr) {
                                console.error('Error uploading images:', uploadErr);
                            }
                        }
                        break;
                    case "fortnite":
                        response = await axios.patch(
                            `http://localhost:3003/fortnite/${initialData?._id}`,
                            accountData,
                            {
                                headers: {
                                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                                }
                            }
                        )
                        console.log('Account updated successfully:', response.data)

                        // Update with gallery in a separate request if there are images
                        if (formData.gallery && formData.gallery.length > 0) {
                            console.log('Preparing to upload images:', formData.gallery);
                            const formDataObj = new FormData();
                            formData.gallery.forEach((file, idx) => {
                                console.log(`Appending file [${idx}]:`, file);
                                formDataObj.append('images', file);
                            });
                            try {
                                const uploadResponse = await axios.put(
                                    `http://localhost:3003/fortnite/${initialData?._id}/pictures`,
                                    formDataObj,
                                    {
                                        headers: {
                                            'Authorization': `Bearer ${localStorage.getItem('token')}`,
                                            'Content-Type': 'multipart/form-data'
                                        }
                                    }
                                );
                                console.log('Image upload response:', uploadResponse.data);
                            } catch (uploadErr) {
                                console.error('Error uploading images:', uploadErr);
                            }
                        }
                        break;
                    case "league of legends":
                        response = await axios.patch(
                            `http://localhost:3003/leagueoflegends/${initialData?._id}`,
                            accountData,
                            {
                                headers: {
                                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                                }
                            }
                        )
                        console.log('Account updated successfully:', response.data)

                        // Update with gallery in a separate request if there are images
                        if (formData.gallery && formData.gallery.length > 0) {
                            console.log('Preparing to upload images:', formData.gallery);
                            const formDataObj = new FormData();
                            formData.gallery.forEach((file, idx) => {
                                console.log(`Appending file [${idx}]:`, file);
                                formDataObj.append('images', file);
                            });
                            try {
                                const uploadResponse = await axios.put(
                                    `http://localhost:3003/leagueoflegends/${initialData?._id}/pictures`,
                                    formDataObj,
                                    {
                                        headers: {
                                            'Authorization': `Bearer ${localStorage.getItem('token')}`,
                                            'Content-Type': 'multipart/form-data'
                                        }
                                    }
                                );
                                console.log('Image upload response:', uploadResponse.data);
                            } catch (uploadErr) {
                                console.error('Error uploading images:', uploadErr);
                            }
                        }
                        break;
                }

                if (response && response.data) {
                    // Show success message
                    // Close modal and reset form on success
                    onClose();
                    setFormData({
                        title: "",
                        slug: "",
                        price: "",
                        gameType: "Valorant",
                        description: "",
                        gallery: [],
                        server: "",
                        current_rank: "Unranked",
                        level: 1,
                        valorant_points: 0,
                        radianite_points: 0,
                        town_hall_level: "",
                        builder_hall_level: "",
                        gems: 0,
                        trophies: 0,
                        clan: "",
                        trophy_range: "",
                        brawlers_unlocked: 0,
                        club: "",
                        platform: "",
                        region: "",
                        account_level: 1,
                        vbucks: 0,
                        skins: 0,
                        battle_pass: "",
                        rank: "",
                        division: "",
                        blue_essence: 0,
                        rp: 0,
                        champions: 0,
                        login: "",
                        password: "",
                        email_login: "",
                        email_password: "",
                        in_game_name: "",
                        has_2fa: false,
                        delivery_instructions: "",
                        delivery_type: "instant"
                    });
                    setCurrentStep(1);
                    return;
                }
            } else {
                // Create new account
                let response;
                let accountId;

                switch (formData.gameType.toLowerCase()) {
                    case "valorant":
                        response = await axios.post(
                            'http://localhost:3003/valorant',
                            accountData,
                            {
                                headers: {
                                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                                }
                            }
                        )
                        console.log('Account created successfully:', response.data)

                        // Get account ID from response
                        accountId = response.data.data?.account?._id || response.data._id;
                        console.log('Account ID:', accountId);
                        // Update with gallery in a separate request if there are images
                        if (accountId && formData.gallery && formData.gallery.length > 0) {
                            console.log('Preparing to upload images:', formData.gallery);
                            const formDataObj = new FormData();
                            formData.gallery.forEach((file, idx) => {
                                console.log(`Appending file [${idx}]:`, file);
                                formDataObj.append('images', file);
                            });
                            try {
                                const uploadResponse = await axios.put(
                                    `http://localhost:3003/valorant/accounts/${accountId}/pictures`,
                                    formDataObj,
                                    {
                                        headers: {
                                            'Authorization': `Bearer ${localStorage.getItem('token')}`,
                                            'Content-Type': 'multipart/form-data'
                                        }
                                    }
                                );
                                console.log('Image upload response:', uploadResponse.data);
                            } catch (uploadErr) {
                                console.error('Error uploading images:', uploadErr);
                            }
                        }
                        break;
                    case "clash of clans":
                        response = await axios.post(
                            'http://localhost:3003/clashofclans',
                            accountData,
                            {
                                headers: {
                                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                                }
                            }
                        )
                        console.log('Account created successfully:', response.data)

                        // Get account ID from response
                        accountId = response.data.data?.account?._id || response.data._id || response.data.account?._id;
                        console.log('Clash of Clans Account ID:', accountId);

                        // Update with gallery in a separate request if there are images
                        if (accountId && formData.gallery && formData.gallery.length > 0) {
                            console.log('Preparing to upload images:', formData.gallery);
                            const formDataObj = new FormData();
                            formData.gallery.forEach((file, idx) => {
                                console.log(`Appending file [${idx}]:`, file);
                                formDataObj.append('images', file);
                            });
                            try {
                                const uploadResponse = await axios.put(
                                    `http://localhost:3003/clashofclans/accounts/${accountId}/pictures`,
                                    formDataObj,
                                    {
                                        headers: {
                                            'Authorization': `Bearer ${localStorage.getItem('token')}`,
                                            'Content-Type': 'multipart/form-data'
                                        }
                                    }
                                );
                                console.log('Image upload response:', uploadResponse.data);
                            } catch (uploadErr) {
                                console.error('Error uploading images:', uploadErr);
                            }
                        }
                        break;
                    case "brawl stars":
                        response = await axios.post(
                            'http://localhost:3003/brawlstars',
                            accountData,
                            {
                                headers: {
                                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                                }
                            }
                        )
                        console.log('Account created successfully:', response.data)

                        // Get account ID from response
                        accountId = response.data.data?.account?._id || response.data._id || response.data.account?._id;
                        console.log('Brawl Stars Account ID:', accountId);

                        // Update with gallery in a separate request if there are images
                        if (accountId && formData.gallery && formData.gallery.length > 0) {
                            console.log('Preparing to upload images:', formData.gallery);
                            const formDataObj = new FormData();
                            formData.gallery.forEach((file, idx) => {
                                console.log(`Appending file [${idx}]:`, file);
                                formDataObj.append('images', file);
                            });
                            try {
                                const uploadResponse = await axios.put(
                                    `http://localhost:3003/brawlstars/accounts/${accountId}/pictures`,
                                    formDataObj,
                                    {
                                        headers: {
                                            'Authorization': `Bearer ${localStorage.getItem('token')}`,
                                            'Content-Type': 'multipart/form-data'
                                        }
                                    }
                                );
                                console.log('Image upload response:', uploadResponse.data);
                            } catch (uploadErr) {
                                console.error('Error uploading images:', uploadErr);
                            }
                        }
                        break;
                    case "fortnite":
                        response = await axios.post(
                            'http://localhost:3003/fortnite',
                            accountData,
                            {
                                headers: {
                                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                                }
                            }
                        )
                        console.log('Account created successfully:', response.data)

                        // Get account ID from response
                        accountId = response.data.data?.account?._id || response.data._id || response.data.account?._id;
                        console.log('Fortnite Account ID:', accountId);

                        // Update with gallery in a separate request if there are images
                        if (accountId && formData.gallery && formData.gallery.length > 0) {
                            console.log('Preparing to upload images:', formData.gallery);
                            const formDataObj = new FormData();
                            formData.gallery.forEach((file, idx) => {
                                console.log(`Appending file [${idx}]:`, file);
                                formDataObj.append('images', file);
                            });
                            try {
                                const uploadResponse = await axios.put(
                                    `http://localhost:3003/fortnite/accounts/${accountId}/pictures`,
                                    formDataObj,
                                    {
                                        headers: {
                                            'Authorization': `Bearer ${localStorage.getItem('token')}`,
                                            'Content-Type': 'multipart/form-data'
                                        }
                                    }
                                );
                                console.log('Image upload response:', uploadResponse.data);
                            } catch (uploadErr) {
                                console.error('Error uploading images:', uploadErr);
                            }
                        }
                        break;
                    case "league of legends":
                        response = await axios.post(
                            'http://localhost:3003/leagueoflegends',
                            accountData,
                            {
                                headers: {
                                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                                }
                            }
                        )
                        console.log('Account created successfully:', response.data)

                        // Get account ID from response
                        accountId = response.data.data?.account?._id || response.data._id || response.data.account?._id;
                        console.log('League of Legends Account ID:', accountId);

                        // Update with gallery in a separate request if there are images
                        if (accountId && formData.gallery && formData.gallery.length > 0) {
                            console.log('Preparing to upload images:', formData.gallery);
                            const formDataObj = new FormData();
                            formData.gallery.forEach((file, idx) => {
                                console.log(`Appending file [${idx}]:`, file);
                                formDataObj.append('images', file);
                            });
                            try {
                                const uploadResponse = await axios.put(
                                    `http://localhost:3003/leagueoflegends/accounts/${accountId}/pictures`,
                                    formDataObj,
                                    {
                                        headers: {
                                            'Authorization': `Bearer ${localStorage.getItem('token')}`,
                                            'Content-Type': 'multipart/form-data'
                                        }
                                    }
                                );
                                console.log('Image upload response:', uploadResponse.data);
                            } catch (uploadErr) {
                                console.error('Error uploading images:', uploadErr);
                            }
                        }
                        break;
                }

                if (response && response.data) {
                    // Show success message
                    // Close modal and reset form on success
                    onClose();
                    setFormData({
                        title: "",
                        slug: "",
                        price: "",
                        gameType: "Valorant",
                        description: "",
                        gallery: [],
                        server: "",
                        current_rank: "Unranked",
                        level: 1,
                        valorant_points: 0,
                        radianite_points: 0,
                        town_hall_level: "",
                        builder_hall_level: "",
                        gems: 0,
                        trophies: 0,
                        clan: "",
                        trophy_range: "",
                        brawlers_unlocked: 0,
                        club: "",
                        platform: "",
                        region: "",
                        account_level: 1,
                        vbucks: 0,
                        skins: 0,
                        battle_pass: "",
                        rank: "",
                        division: "",
                        blue_essence: 0,
                        rp: 0,
                        champions: 0,
                        login: "",
                        password: "",
                        email_login: "",
                        email_password: "",
                        in_game_name: "",
                        has_2fa: false,
                        delivery_instructions: "",
                        delivery_type: "instant"
                    });
                    setCurrentStep(1);
                    return;
                }
            }

        } catch (error) {
            console.error("Error creating/updating account:", error)
            setSubmitError(error.response?.data?.message || "Failed to create/update account. Please try again.")
        } finally {
            setIsSubmitting(false)
        }
    }

    if (!isOpen) return null

    return (
        <div className="acm-modal-overlay">
            <div className="acm-modal-container">
                <div className="acm-modal-header">
                    <h2>{isEditMode ? "Edit Account" : "Add new Account"}</h2>
                    <button className="acm-close-button" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                <div className="acm-modal-steps">
                    <div className={`acm-step ${currentStep === 1 ? "active" : currentStep > 1 ? "completed" : ""}`}>
                        <div className="acm-step-number">1</div>
                        <div className="acm-step-label">Listing Info</div>
                    </div>
                    <div className={`acm-step ${currentStep === 2 ? "active" : currentStep > 2 ? "completed" : ""}`}>
                        <div className="acm-step-number">2</div>
                        <div className="acm-step-label">Game Data</div>
                    </div>
                    <div className={`acm-step ${currentStep === 3 ? "active" : ""}`}>
                        <div className="acm-step-number">3</div>
                        <div className="acm-step-label">Credentials</div>
                    </div>
                </div>

                <div className="acm-modal-content">
                    {currentStep === 1 && (
                        <Step1ListingInfo
                            formData={formData}
                            handleChange={handleChange}
                            handleSlugChange={handleSlugChange}
                            errors={errors}
                        />
                    )}

                    {currentStep === 2 && (
                        <>
                            {formData.gameType === "Valorant" && (
                                <Step2ValorantData
                                    formData={formData}
                                    handleChange={handleChange}
                                    errors={errors}
                                />
                            )}
                            {formData.gameType === "Clash of Clans" && (
                                <Step2ClashOfClansData
                                    formData={formData}
                                    handleChange={handleChange}
                                    errors={errors}
                                />
                            )}
                            {formData.gameType === "Brawl Stars" && (
                                <Step2BrawlStarsData
                                    formData={formData}
                                    handleChange={handleChange}
                                    errors={errors}
                                />
                            )}
                            {formData.gameType === "Fortnite" && (
                                <Step2FortniteData
                                    formData={formData}
                                    handleChange={handleChange}
                                    errors={errors}
                                />
                            )}
                            {formData.gameType === "League of Legends" && (
                                <Step2LeagueOfLegendsData
                                    formData={formData}
                                    handleChange={handleChange}
                                    errors={errors}
                                />
                            )}
                        </>
                    )}

                    {currentStep === 3 && (
                        <Step3Credentials
                            formData={formData}
                            handleChange={handleChange}
                            errors={errors}
                        />
                    )}

                    {submitError && (
                        <div className="acm-error-message">{submitError}</div>
                    )}
                </div>

                <div className="acm-modal-footer">
                    {currentStep > 1 ? (
                        <button className="acm-btn acm-btn-secondary" onClick={prevStep} disabled={isSubmitting}>
                            ← Previous
                        </button>
                    ) : (
                        <button className="acm-btn acm-btn-secondary" onClick={onClose} disabled={isSubmitting}>
                            Cancel
                        </button>
                    )}

                    {currentStep < 3 ? (
                        <button className="acm-btn acm-btn-primary" onClick={nextStep}>
                            Continue →
                        </button>
                    ) : (
                        <button
                            className="acm-btn acm-btn-primary"
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? "Saving..." : isEditMode ? "Update Account" : "Add Account"}
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}

export default AddAccountModal
